import os
import sys
import urllib.request
import pickle
import cv2
import numpy as np
import mysql.connector
from dotenv import load_dotenv

def safe_print(message):
    try:
        print(message)
    except UnicodeEncodeError:
        try:
            print(message.encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8'))
        except Exception:
            try:
                print(message.encode('ascii', errors='backslashreplace').decode('ascii'))
            except Exception:
                pass

# Load env variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASSWORD", "TVU@842004")
DB_NAME = os.getenv("DB_NAME", "amthuc_phuongnam")

# Paths configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

YUNET_PATH = os.path.join(MODELS_DIR, 'face_detection_yunet_2023mar.onnx')
SFACE_PATH = os.path.join(MODELS_DIR, 'face_recognition_sface_2021dec.onnx')
EMBEDDINGS_PKL = os.path.join(MODELS_DIR, 'face_embeddings.pkl')

BACKEND_UPLOADS_DIR = os.path.abspath(os.path.join(BASE_DIR, '../backend'))

# Model download URLs
YUNET_URL = "https://huggingface.co/opencv/face_detection_yunet/resolve/main/face_detection_yunet_2023mar.onnx"
SFACE_URL = "https://huggingface.co/opencv/face_recognition_sface/resolve/main/face_recognition_sface_2021dec.onnx"

def download_file(url, filepath):
    if not os.path.exists(filepath):
        safe_print(f"📥 Downloading {url} to {filepath}...")
        try:
            # Configure a user-agent to avoid being blocked by HuggingFace
            opener = urllib.request.build_opener()
            opener.addheaders = [('User-agent', 'Mozilla/5.0')]
            urllib.request.install_opener(opener)
            urllib.request.urlretrieve(url, filepath)
            safe_print(f"✅ Downloaded {os.path.basename(filepath)}")
        except Exception as e:
            safe_print(f"❌ Failed to download {url}: {e}")
            raise e

# Try to download models
try:
    download_file(YUNET_URL, YUNET_PATH)
    download_file(SFACE_URL, SFACE_PATH)
except Exception as e:
    safe_print(f"⚠️ Warning: Could not complete model downloads: {e}")

# OpenCV Face detector & recognizer instances
detector = None
recognizer = None

def get_face_objects():
    global detector, recognizer
    if detector is None or recognizer is None:
        if os.path.exists(YUNET_PATH) and os.path.exists(SFACE_PATH):
            # Input size placeholder, will be set per image in detect
            detector = cv2.FaceDetectorYN.create(
                YUNET_PATH, "", (320, 320), 0.9, 0.3, 5000
            )
            recognizer = cv2.FaceRecognizerSF.create(
                SFACE_PATH, ""
            )
            safe_print("🤖 Face models initialized successfully.")
        else:
            safe_print("❌ Model files not found! YuNet or SFace is missing.")
    return detector, recognizer

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )

def extract_face_embedding(img_path):
    """
    Detects a face in the image at img_path and returns the 128-dimensional SFace feature vector.
    """
    det, rec = get_face_objects()
    if det is None or rec is None:
        return None

    if not os.path.exists(img_path):
        safe_print(f"⚠️ Image path does not exist: {img_path}")
        return None

    img = cv2.imread(img_path)
    if img is None:
        safe_print(f"⚠️ Failed to read image: {img_path}")
        return None

    h, w, c = img.shape
    det.setInputSize((w, h))
    retval, faces = det.detect(img)

    if retval > 0 and faces is not None:
        # Align and crop face
        face_align = rec.alignCrop(img, faces[0])
        # Extract features
        face_feature = rec.feature(face_align)
        return face_feature
    else:
        safe_print(f"⚠️ No face detected in image: {img_path}")
        return None

def train_face_model():
    """
    Fetches all active, non-deleted employees with an avatar, extracts face embeddings, 
    and saves them in models/face_embeddings.pkl
    """
    safe_print("🔄 Training face recognition embeddings...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT ma_nhan_vien, ma_nv_code, ten_nhan_vien, anh_dai_dien FROM nhan_vien WHERE trang_thai = 1 AND is_deleted = 0"
        )
        employees = cursor.fetchall()
        cursor.close()
        conn.close()

        embeddings_db = {}
        success_count = 0

        for emp in employees:
            ma_nv = emp['ma_nv_code']
            avatar = emp['anh_dai_dien']
            name = emp['ten_nhan_vien']

            if not avatar:
                safe_print(f"ℹ️ Skipping {name} ({ma_nv}) - No avatar image.")
                continue

            # Resolve avatar path. If it is relative (starts with /uploads), append to backend path
            if avatar.startswith('/'):
                img_path = os.path.join(BACKEND_UPLOADS_DIR, avatar.lstrip('/'))
            else:
                img_path = os.path.join(BACKEND_UPLOADS_DIR, avatar)

            img_path = os.path.abspath(img_path)
            safe_print(f"📸 Processing avatar for {name} ({ma_nv}): {img_path}")

            feat = extract_face_embedding(img_path)
            if feat is not None:
                embeddings_db[ma_nv] = feat
                success_count += 1
                safe_print(f"✅ Extracted embedding for {name} ({ma_nv})")
            else:
                safe_print(f"❌ Failed to extract face for {name} ({ma_nv})")

        # Save embeddings
        with open(EMBEDDINGS_PKL, 'wb') as f:
            pickle.dump(embeddings_db, f)

        safe_print(f"🎉 Training complete! Registered {success_count}/{len(employees)} employees.")
        return True, success_count
    except Exception as e:
        safe_print(f"❌ Error training face model: {e}")
        return False, 0

def verify_face(ma_nv_code, checkin_image_path):
    """
    Verifies if the face in checkin_image_path matches the registered embedding of ma_nv_code,
    or performs 1-to-N search to identify the employee if ma_nv_code is None.
    SFace cosine threshold: >= 0.363 is considered a match.
    """
    if ma_nv_code:
        safe_print(f"🔍 Verifying face for employee: {ma_nv_code} using: {checkin_image_path}")
    else:
        safe_print(f"🔍 Identifying face from: {checkin_image_path} against all registered employees")
        
    det, rec = get_face_objects()
    if det is None or rec is None:
        return False, 0.0, "Face recognition models not initialized."

    # Load embeddings
    embeddings = {}
    if os.path.exists(EMBEDDINGS_PKL):
        try:
            with open(EMBEDDINGS_PKL, 'rb') as f:
                embeddings = pickle.load(f)
        except Exception as e:
            safe_print(f"⚠️ Error loading embeddings pickle: {e}")

    # Extract checkin photo feature
    checkin_feat = extract_face_embedding(checkin_image_path)
    if checkin_feat is None:
        return False, 0.0, "Không thể nhận diện khuôn mặt trong ảnh chấm công!"

    threshold = 0.363

    # If ma_nv_code is not provided, perform 1-to-N search
    if not ma_nv_code:
        if not embeddings:
            return False, 0.0, "Không có dữ liệu khuôn mặt nhân viên nào được tải!"

        best_score = -1.0
        best_match_code = None

        for code, ref_feat in embeddings.items():
            # Check shape of features to avoid cv2 crashes
            if ref_feat is None or ref_feat.shape != checkin_feat.shape:
                continue
            score = rec.match(ref_feat, checkin_feat, cv2.FaceRecognizerSF_FR_COSINE)
            if score > best_score:
                best_score = score
                best_match_code = code

        matched = bool(best_score >= threshold)
        safe_print(f"📊 Face Search Best Score: {best_score:.4f} (Threshold: {threshold}) for: {best_match_code}. Matched: {matched}")

        if matched:
            return True, float(best_score), best_match_code
        else:
            return False, float(best_score), "Khuôn mặt chụp được không khớp với bất kỳ nhân viên nào đã đăng ký!"

    # 1-to-1 Verification Mode
    # If the employee code is not in pickle, try to check if they have an avatar and extract dynamically
    if ma_nv_code not in embeddings:
        safe_print(f"ℹ️ Code {ma_nv_code} not found in saved embeddings. Attempting dynamic extraction...")
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT anh_dai_dien FROM nhan_vien WHERE ma_nv_code = %s AND trang_thai = 1 AND is_deleted = 0",
                (ma_nv_code,)
            )
            emp = cursor.fetchone()
            cursor.close()
            conn.close()

            if emp and emp['anh_dai_dien']:
                avatar = emp['anh_dai_dien']
                if avatar.startswith('/'):
                    img_path = os.path.join(BACKEND_UPLOADS_DIR, avatar.lstrip('/'))
                else:
                    img_path = os.path.join(BACKEND_UPLOADS_DIR, avatar)
                img_path = os.path.abspath(img_path)
                feat = extract_face_embedding(img_path)
                if feat is not None:
                    embeddings[ma_nv_code] = feat
                    # Save back updated embeddings
                    try:
                        with open(EMBEDDINGS_PKL, 'wb') as f:
                            pickle.dump(embeddings, f)
                    except Exception:
                        pass
        except Exception as e:
            safe_print(f"⚠️ Error fetching dynamic avatar: {e}")

    if ma_nv_code not in embeddings:
        return False, 0.0, "Không tìm thấy dữ liệu khuôn mặt đã đăng ký của nhân viên!"

    # Compare checkin embedding with registered embedding
    ref_feat = embeddings[ma_nv_code]
    
    # SFace match score
    # score ranges from [-1, 1] for cosine similarity, higher is better
    score = rec.match(ref_feat, checkin_feat, cv2.FaceRecognizerSF_FR_COSINE)
    matched = bool(score >= threshold)
    
    safe_print(f"📊 Face Match Score: {score:.4f} (Threshold: {threshold}). Matched: {matched}")
    
    if matched:
        return True, float(score), "Xác minh khuôn mặt thành công!"
    else:
        return False, float(score), "Khuôn mặt chụp được không khớp với nhân viên đã đăng ký!"

if __name__ == "__main__":
    # If run directly, run training
    get_face_objects()
    train_face_model()

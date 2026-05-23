import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import get_svd_recommendations, train_collaborative_model
from apriori_service import train_apriori_model, get_apriori_recommendations
from admin_bot_service import ask_business_bot
from hybrid_recommendation import get_hybrid_recommendations
from rag_service import retrieve_knowledge
from face_service import train_face_model, verify_face

app = Flask(__name__)
CORS(app)  # Allow Node.js calling this API

@app.route('/api/ml/recommend/hybrid', methods=['GET'])
def get_hybrid():
    """
    Gợi ý lai ghép kết hợp 4 yếu tố:
    1. Collaborative Filtering (lọc cộng tác)
    2. Content-based (từ khóa tìm kiếm)
    3. Context-aware (dữ liệu chatbot)
    4. Rating-based (số sao đánh giá)
    """
    try:
        user_id = request.args.get('user_id')
        search_keyword = request.args.get('keyword', '')
        limit = int(request.args.get('limit', 10))
        
        # Trọng số tùy chỉnh (optional)
        weight_collab = float(request.args.get('w_collab', 0.30))
        weight_content = float(request.args.get('w_content', 0.25))
        weight_chatbot = float(request.args.get('w_chatbot', 0.25))
        weight_rating = float(request.args.get('w_rating', 0.20))
        
        weights = {
            'collaborative': weight_collab,
            'content': weight_content,
            'chatbot': weight_chatbot,
            'rating': weight_rating
        }
        
        if not user_id:
            return jsonify({"success": False, "message": "Thiếu user_id"}), 400
        
        results = get_hybrid_recommendations(
            user_id=int(user_id),
            search_keyword=search_keyword,
            top_n=limit,
            weights=weights
        )
        
        if not results:
            return jsonify({
                "success": True,
                "data": [],
                "message": "Không có gợi ý phù hợp."
            }), 200
        
        return jsonify({
            "success": True,
            "data": results,
            "message": "Gợi ý cá nhân hóa từ hệ thống lai ghép.",
            "weights_used": weights
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/recommend/collaborative', methods=['GET'])
def get_recommendations():
    """ Trả về List Item Id gợi ý bằng Collaborative Filtering SVD """
    user_id = request.args.get('user_id')
    limit = int(request.args.get('limit', 5))
    
    if not user_id:
        return jsonify({"success": False, "message": "Thiếu user_id"}), 400
        
    try:
        items = get_svd_recommendations(int(user_id), limit)
        
        if not items:
            return jsonify({
                "success": True, 
                "data": [],
                "message": "Không đủ data (Cold-start), fallback vào Node.js."
            }), 200
            
        return jsonify({
            "success": True,
            "data": items,
            "message": "Gợi ý cá nhân hóa từ mô hình Collaborative Filtering."
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/recommend/apriori', methods=['GET'])
def get_apriori():
    """ Trả về List Item Id gợi ý bằng Apriori dựa vào giỏ hàng """
    try:
        cart_ids = request.args.get('cart', '')
        limit = int(request.args.get('limit', 4))
        
        if not cart_ids:
            return jsonify({"success": False, "message": "Thiếu cart items"}), 400
            
        # Parse list of item ids (comma-separated string)
        ids_list = [int(i.strip()) for i in cart_ids.split(',')]
        
        items = get_apriori_recommendations(ids_list, limit)
        
        if not items:
            return jsonify({
                "success": True, 
                "data": [],
                "message": "Không có quy tắc kết hợp cho các món này."
            }), 200
            
        return jsonify({
            "success": True,
            "data": items,
            "message": "Gợi ý món ăn kèm từ Apriori."
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/admin/chat', methods=['POST'])
def admin_chat():
    """ Trả lời câu hỏi phân tích kinh doanh của Admin thông qua LangChain SQL Agent """
    try:
        data = request.json
        question = data.get('question', '')
        
        if not question:
            return jsonify({"success": False, "message": "Câu hỏi rỗng."}), 400
            
        answer = ask_business_bot(question)
        
        return jsonify({
            "success": True,
            "answer": answer
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/chatbot/retrieve', methods=['POST'])
def chatbot_retrieve():
    """ Tìm kiếm ngữ nghĩa trên dữ liệu tri thức của chatbot (RAG) """
    try:
        data = request.json or {}
        question = data.get('question', '')
        top_n = int(data.get('top_n', 2))
        threshold = float(data.get('threshold', 0.05))
        
        if not question:
            return jsonify({"success": False, "message": "Câu hỏi không được để trống."}), 400
            
        retrieved_docs = retrieve_knowledge(question, top_n=top_n, threshold=threshold)
        
        return jsonify({
            "success": True,
            "data": retrieved_docs
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/train', methods=['POST'])
def trigger_training():
    """ Đánh thức thủ công tiến trình Train Model """
    result_svd = train_collaborative_model()
    result_apriori = train_apriori_model()
    
    if result_svd or result_apriori:
        return jsonify({"success": True, "message": "Huấn luyện mô hình thành công!"})
    return jsonify({"success": False, "message": "Không thể huấn luyện mô hình. Hãy kiểm tra Logs."})

@app.route('/api/ml/face/train', methods=['POST'])
def train_face():
    """ Huấn luyện/Trích xuất vector đặc trưng khuôn mặt cho nhân viên """
    try:
        success, count = train_face_model()
        if success:
            return jsonify({"success": True, "message": f"Huấn luyện thành công {count} nhân viên."}), 200
        else:
            return jsonify({"success": False, "message": "Có lỗi xảy ra khi huấn luyện khuôn mặt!"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/face/detect-only', methods=['POST'])
def detect_only_endpoint():
    """ Kiểm tra nhanh xem có khuôn mặt trong ảnh hay không (phục vụ quét thời gian thực) """
    try:
        import cv2
        import base64
        import numpy as np
        from face_service import get_face_objects
        
        data = request.json or {}
        image_base64 = data.get('image_base64')
        if not image_base64:
            return jsonify({"success": False, "message": "Thiếu ảnh!"}), 400
            
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
            
        img_data = base64.b64decode(image_base64)
        
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"success": False, "message": "Không thể giải mã ảnh!"}), 400
            
        det, _ = get_face_objects()
        if det is None:
            return jsonify({"success": False, "message": "Detector chưa khởi tạo!"}), 500
            
        h, w, c = img.shape
        det.setInputSize((w, h))
        retval, faces = det.detect(img)
        
        face_detected = bool(retval > 0 and faces is not None)
        box = None
        if face_detected:
            box = {
                "x": float(faces[0][0]),
                "y": float(faces[0][1]),
                "w": float(faces[0][2]),
                "h": float(faces[0][3])
            }
        
        return jsonify({
            "success": True,
            "face_detected": face_detected,
            "box": box
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/face/crop', methods=['POST'])
def crop_face_endpoint():
    """ Trích chọn và căn chỉnh khuôn mặt chuẩn để lưu làm dữ liệu mẫu """
    try:
        import cv2
        import time
        import random
        from face_service import get_face_objects
        
        data = request.json or {}
        image_path = data.get('image_path')
        image_base64 = data.get('image_base64')
        
        temp_path = None
        if image_base64:
            import base64
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            img_data = base64.b64decode(image_base64)
            temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, "temp_to_crop.jpg")
            with open(temp_path, 'wb') as f:
                f.write(img_data)
            input_image_path = temp_path
        elif image_path:
            normalized_path = image_path.replace('\\', '/')
            if normalized_path.startswith('/'):
                input_image_path = os.path.join(os.path.dirname(__file__), '../backend', normalized_path.lstrip('/'))
            elif normalized_path.startswith('uploads/'):
                input_image_path = os.path.join(os.path.dirname(__file__), '../backend', normalized_path)
            elif os.path.isabs(image_path):
                input_image_path = image_path
            else:
                input_image_path = os.path.join(os.path.dirname(__file__), '../backend', normalized_path)
        else:
            return jsonify({"success": False, "message": "Thiếu ảnh đầu vào!"}), 400

        # Read image
        img = cv2.imread(input_image_path)
        if img is None:
            return jsonify({"success": False, "message": "Không thể đọc được ảnh đầu vào!"}), 400

        # Detect face
        det, rec = get_face_objects()
        if det is None or rec is None:
            return jsonify({"success": False, "message": "Mô hình nhận diện chưa khởi tạo!"}), 500

        h, w, c = img.shape
        det.setInputSize((w, h))
        retval, faces = det.detect(img)

        if retval > 0 and faces is not None:
            # Align and crop face
            face_align = rec.alignCrop(img, faces[0])
            
            # Save cropped face to backend uploads/staff folder
            backend_staff_dir = os.path.join(os.path.dirname(__file__), '../backend/uploads/staff')
            os.makedirs(backend_staff_dir, exist_ok=True)
            
            filename = f"crop-{int(time.time())}-{random.randint(1000, 9999)}.jpg"
            save_path = os.path.join(backend_staff_dir, filename)
            
            cv2.imwrite(save_path, face_align)
            
            # Return relative URL
            relative_url = f"/uploads/staff/{filename}"
            
            # Cleanup temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
                    
            return jsonify({
                "success": True,
                "url": relative_url,
                "message": "Trích chọn và căn chỉnh khuôn mặt thành công!"
            }), 200
        else:
            # Cleanup temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
            return jsonify({"success": False, "message": "Không phát hiện thấy khuôn mặt trong ảnh!"}), 400

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ml/face/verify', methods=['POST'])
def verify_face_endpoint():
    """ Xác minh khuôn mặt chấm công """
    try:
        data = request.json or {}
        ma_nv_code = data.get('ma_nv_code')
        image_path = data.get('image_path')
        image_base64 = data.get('image_base64')


        temp_path = None
        if image_base64:
            import base64
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            img_data = base64.b64decode(image_base64)
            temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            suffix = ma_nv_code if ma_nv_code else "search"
            temp_path = os.path.join(temp_dir, f"temp_verify_{suffix}.jpg")
            with open(temp_path, 'wb') as f:
                f.write(img_data)
            checkin_image = temp_path
        elif image_path:
            normalized_path = image_path.replace('\\', '/')
            if normalized_path.startswith('/'):
                checkin_image = os.path.join(os.path.dirname(__file__), '../backend', normalized_path.lstrip('/'))
            elif normalized_path.startswith('uploads/'):
                checkin_image = os.path.join(os.path.dirname(__file__), '../backend', normalized_path)
            elif os.path.isabs(image_path):
                checkin_image = image_path
            else:
                checkin_image = os.path.join(os.path.dirname(__file__), '../backend', normalized_path)
        else:
            return jsonify({"success": False, "message": "Thiếu ảnh chấm công!"}), 400

        # Verify / Identify
        matched, score, message_or_code = verify_face(ma_nv_code, checkin_image)

        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

        if not ma_nv_code:
            if matched:
                return jsonify({
                    "success": True,
                    "similarity": score,
                    "ma_nv_code": message_or_code,
                    "message": "Xác minh khuôn mặt thành công!"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "similarity": score,
                    "message": message_or_code
                }), 200
        else:
            return jsonify({
                "success": matched,
                "similarity": score,
                "message": message_or_code,
                "ma_nv_code": ma_nv_code if matched else None
            }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    # Train the model once at startup to ensure the file exists.
    train_collaborative_model()
    train_apriori_model()
    # Try training face model once
    try:
        train_face_model()
    except Exception as e:
        print(f"Error training face model at startup: {e}")
    print("🚀 AI Microservice is running on port 5000!")
    app.run(host='0.0.0.0', port=5000, debug=True)

"""
Hybrid Recommendation System
Kết hợp 4 yếu tố:
1. Collaborative Filtering (SVD) - Lọc cộng tác
2. Content-based (Từ khóa tìm kiếm)
3. Context-aware (Dữ liệu chatbot)
4. Rating-based (Số sao đánh giá)

Xem chi tiết: HYBRID_RECOMMENDATION_GUIDE.md
"""

import os
import pandas as pd
import numpy as np
import mysql.connector
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load env variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASSWORD", "TVU@842004")
DB_NAME = os.getenv("DB_NAME", "amthuc_phuongnam")

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )

def get_collaborative_score(user_id, item_ids):
    """
    Lấy điểm từ Collaborative Filtering (SVD)
    Returns: dict {item_id: score}
    """
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'svd_model.pkl')
        if not os.path.exists(model_path):
            return {}

        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
            
        user_ids = model_data['user_ids']
        item_ids_model = model_data['item_ids']
        user_matrix = model_data['user_matrix']
        item_matrix = model_data['item_matrix']

        if user_id not in user_ids:
            return {}

        user_idx = user_ids.index(user_id)
        user_vector = user_matrix[user_idx]
        predicted_ratings = np.dot(user_vector, item_matrix)
        
        scores = {}
        for item_id in item_ids:
            if item_id in item_ids_model:
                item_idx = item_ids_model.index(item_id)
                scores[item_id] = float(predicted_ratings[item_idx])
        
        return scores
        
    except Exception as e:
        print(f"❌ Lỗi get_collaborative_score: {str(e)}")
        return {}

def get_content_based_score(search_keyword, item_ids):
    """
    Tính điểm dựa trên từ khóa tìm kiếm (Content-based)
    Sử dụng TF-IDF để so sánh keyword với tên món + mô tả
    Returns: dict {item_id: score}
    """
    try:
        if not search_keyword or not search_keyword.strip():
            return {}
            
        conn = get_db_connection()
        
        # Lấy thông tin món ăn
        placeholders = ','.join(['%s'] * len(item_ids))
        query = f"""
            SELECT ma_mon, ten_mon, mo_ta, danh_muc
            FROM mon_an
            WHERE ma_mon IN ({placeholders})
        """
        df = pd.read_sql(query, conn, params=item_ids)
        conn.close()
        
        if df.empty:
            return {}
        
        # Tạo text corpus: kết hợp tên + mô tả + danh mục
        df['content'] = df['ten_mon'].fillna('') + ' ' + \
                       df['mo_ta'].fillna('') + ' ' + \
                       df['danh_muc'].fillna('')
        
        # Thêm keyword vào đầu corpus
        corpus = [search_keyword.lower()] + df['content'].str.lower().tolist()
        
        # TF-IDF
        vectorizer = TfidfVectorizer(max_features=100, stop_words=None)
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # Tính cosine similarity giữa keyword và các món
        keyword_vector = tfidf_matrix[0:1]
        item_vectors = tfidf_matrix[1:]
        similarities = cosine_similarity(keyword_vector, item_vectors)[0]
        
        # Map scores
        scores = {}
        for idx, row in df.iterrows():
            scores[row['ma_mon']] = float(similarities[idx])
        
        return scores
        
    except Exception as e:
        print(f"❌ Lỗi get_content_based_score: {str(e)}")
        return {}

def get_chatbot_context_score(user_id, item_ids, time_window_hours=24):
    """
    Tính điểm dựa trên ngữ cảnh chatbot
    Phân tích các món được nhắc đến trong lịch sử chat gần đây
    Returns: dict {item_id: score}
    """
    try:
        conn = get_db_connection()
        
        # Lấy lịch sử chat trong X giờ gần đây
        time_threshold = datetime.now() - timedelta(hours=time_window_hours)
        query = """
            SELECT noi_dung, nguoi_gui
            FROM lich_su_chatbot
            WHERE ma_nguoi_dung = %s 
            AND thoi_diem_chat >= %s
            ORDER BY thoi_diem_chat DESC
            LIMIT 50
        """
        chat_df = pd.read_sql(query, conn, params=(user_id, time_threshold))
        
        if chat_df.empty:
            conn.close()
            return {}
        
        # Lấy tên các món ăn để so sánh
        placeholders = ','.join(['%s'] * len(item_ids))
        menu_query = f"""
            SELECT ma_mon, ten_mon, danh_muc
            FROM mon_an
            WHERE ma_mon IN ({placeholders})
        """
        menu_df = pd.read_sql(menu_query, conn, params=item_ids)
        conn.close()
        
        if menu_df.empty:
            return {}
        
        # Ghép tất cả nội dung chat thành một văn bản
        chat_text = ' '.join(chat_df['noi_dung'].str.lower().tolist())
        
        scores = {}
        for idx, row in menu_df.iterrows():
            item_id = row['ma_mon']
            item_name = row['ten_mon'].lower()
            category = row['danh_muc'].lower() if row['danh_muc'] else ''
            
            # Đếm số lần xuất hiện tên món hoặc danh mục trong chat
            name_count = chat_text.count(item_name)
            category_count = chat_text.count(category) if category else 0
            
            # Tính điểm: tên món quan trọng hơn danh mục
            score = (name_count * 2.0) + (category_count * 0.5)
            scores[item_id] = score
        
        # Normalize scores to 0-1
        if scores:
            max_score = max(scores.values())
            if max_score > 0:
                scores = {k: v/max_score for k, v in scores.items()}
        
        return scores
        
    except Exception as e:
        print(f"❌ Lỗi get_chatbot_context_score: {str(e)}")
        return {}

def get_rating_based_score(item_ids):
    """
    Tính điểm dựa trên đánh giá sao trung bình
    Returns: dict {item_id: score}
    """
    try:
        conn = get_db_connection()
        
        placeholders = ','.join(['%s'] * len(item_ids))
        query = f"""
            SELECT 
                ma_mon,
                AVG(so_sao) as avg_rating,
                COUNT(*) as rating_count
            FROM danh_gia_san_pham
            WHERE ma_mon IN ({placeholders})
            GROUP BY ma_mon
        """
        df = pd.read_sql(query, conn, params=item_ids)
        conn.close()
        
        if df.empty:
            return {}
        
        scores = {}
        for idx, row in df.iterrows():
            # Normalize rating to 0-1 (assuming 5-star scale)
            # Áp dụng công thức Bayesian Average để tránh bias với ít đánh giá
            avg_rating = row['avg_rating']
            rating_count = row['rating_count']
            
            # Bayesian average: (C * m + R * v) / (C + v)
            # C = confidence (số đánh giá tối thiểu), m = prior mean (3.0)
            # R = rating count, v = average rating
            C = 5  # Cần ít nhất 5 đánh giá để tin tưởng
            m = 3.0  # Prior mean
            bayesian_avg = (C * m + rating_count * avg_rating) / (C + rating_count)
            
            # Normalize to 0-1
            scores[row['ma_mon']] = bayesian_avg / 5.0
        
        return scores
        
    except Exception as e:
        print(f"❌ Lỗi get_rating_based_score: {str(e)}")
        return {}

def get_new_dish_recommendations(user_id, limit=5):
    """
    Gợi ý món mới ra mắt (≤ 30 ngày) phù hợp khẩu vị người dùng
    Score: 85/100 (giữa content-based và collaborative)
    Returns: List of {item_id, score, reason}
    """
    try:
        conn = get_db_connection()
        
        # Lấy khẩu vị yêu thích từ NHIỀU NGUỒN theo thứ tự ưu tiên
        user_flavors_df = pd.DataFrame()
        
        # NGUỒN 1: Sở thích khẩu vị được chọn trực tiếp (ưu tiên cao nhất)
        explicit_pref_query = """
            SELECT DISTINCT kv.id, kv.ten_thuoc_tinh
            FROM so_thich_khau_vi_nguoi_dung st
            JOIN thuoc_tinh_khau_vi kv ON st.id_thuoc_tinh = kv.id
            WHERE st.ma_nguoi_dung = %s
        """
        user_flavors_df = pd.read_sql(explicit_pref_query, conn, params=(user_id,))
        
        if user_flavors_df.empty:
            # NGUỒN 2: Lấy khẩu vị từ lịch sử đánh giá cao (≥4 sao)
            rating_pref_query = """
                SELECT DISTINCT kv.id, kv.ten_thuoc_tinh
                FROM danh_gia_san_pham dg
                JOIN mon_an_khau_vi makv ON dg.ma_mon = makv.ma_mon
                JOIN thuoc_tinh_khau_vi kv ON makv.id_thuoc_tinh = kv.id
                WHERE dg.ma_nguoi_dung = %s AND dg.so_sao >= 4
                LIMIT 5
            """
            user_flavors_df = pd.read_sql(rating_pref_query, conn, params=(user_id,))
        
        if user_flavors_df.empty:
            # NGUỒN 3: Lấy từ user_preference_profile (học máy)
            ml_pref_query = """
                SELECT tag_key, score 
                FROM user_preference_profile 
                WHERE ma_nguoi_dung = %s AND score >= 0.5
            """
            ml_prefs_df = pd.read_sql(ml_pref_query, conn, params=(user_id,))
            
            if not ml_prefs_df.empty:
                # Map tag_key sang id khẩu vị
                tag_key_to_flavor_id = {
                    'cay': 1, 'chua': 2, 'man': 3, 'ngot': 4,
                    'an_chay': 5, 'thanh_mat': 6, 'thit_bo': 7,
                    'thit_ga': 7, 'hai_san': 8, 'chien': 9
                }
                
                flavor_ids = [tag_key_to_flavor_id.get(row['tag_key']) 
                             for _, row in ml_prefs_df.iterrows() 
                             if row['tag_key'] in tag_key_to_flavor_id]
                flavor_ids = [fid for fid in flavor_ids if fid is not None]
                
                if flavor_ids:
                    placeholders = ','.join(['%s'] * len(flavor_ids))
                    ml_flavor_query = f"""
                        SELECT DISTINCT id, ten_thuoc_tinh 
                        FROM thuoc_tinh_khau_vi 
                        WHERE id IN ({placeholders})
                    """
                    user_flavors_df = pd.read_sql(ml_flavor_query, conn, params=tuple(flavor_ids))
        
        if user_flavors_df.empty:
            # NGUỒN 4: Fallback - lấy khẩu vị phổ biến nhất
            popular_flavor_query = """
                SELECT kv.id, kv.ten_thuoc_tinh
                FROM thuoc_tinh_khau_vi kv
                JOIN mon_an_khau_vi makv ON kv.id = makv.id_thuoc_tinh
                GROUP BY kv.id
                ORDER BY COUNT(*) DESC
                LIMIT 3
            """
            user_flavors_df = pd.read_sql(popular_flavor_query, conn)
        
        if user_flavors_df.empty:
            # Không có khẩu vị nào, trả về món mới nhất
            new_dish_query = """
                SELECT ma_mon, ten_mon, ngay_tao, DATEDIFF(NOW(), ngay_tao) as days_old
                FROM mon_an
                WHERE trang_thai = 1 
                AND DATEDIFF(NOW(), ngay_tao) <= 30
                ORDER BY ngay_tao DESC, ma_mon DESC
                LIMIT %s
            """
            new_dishes = pd.read_sql(new_dish_query, conn, params=(limit,))
            conn.close()
            
            results = []
            for idx, row in new_dishes.iterrows():
                results.append({
                    'item_id': row['ma_mon'],
                    'score': 0.85,  # Fixed score
                    'reason': f"🆕 Món mới ra mắt ({row['days_old']} ngày trước)"
                })
            return results
        
        # Lấy món mới phù hợp khẩu vị
        flavor_ids = user_flavors_df['id'].tolist()
        flavor_names = user_flavors_df['ten_thuoc_tinh'].tolist()
        
        placeholders = ','.join(['%s'] * len(flavor_ids))
        new_dish_query = f"""
            SELECT DISTINCT
                ma.ma_mon,
                ma.ten_mon,
                ma.ngay_tao,
                DATEDIFF(NOW(), ma.ngay_tao) as days_old,
                GROUP_CONCAT(kv.ten_thuoc_tinh SEPARATOR ', ') as matched_flavors
            FROM mon_an ma
            JOIN mon_an_khau_vi makv ON ma.ma_mon = makv.ma_mon
            JOIN thuoc_tinh_khau_vi kv ON makv.id_thuoc_tinh = kv.id
            WHERE ma.trang_thai = 1
            AND DATEDIFF(NOW(), ma.ngay_tao) <= 30
            AND kv.id IN ({placeholders})
            GROUP BY ma.ma_mon
            ORDER BY ma.ngay_tao DESC, ma.ma_mon DESC
            LIMIT %s
        """
        
        params = flavor_ids + [limit]
        new_dishes = pd.read_sql(new_dish_query, conn, params=params)
        conn.close()
        
        results = []
        for idx, row in new_dishes.iterrows():
            results.append({
                'item_id': row['ma_mon'],
                'score': 0.85,
                'reason': f"🆕 Món mới ra mắt, hợp khẩu vị của bạn ({row['matched_flavors']})"
            })
        
        return results
        
    except Exception as e:
        print(f"❌ Lỗi get_new_dish_recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def get_hybrid_recommendations(
    user_id, 
    item_ids=None, 
    search_keyword=None,
    top_n=10,
    weights=None
):
    """
    Hệ thống gợi ý lai ghép
    
    Parameters:
    - user_id: ID người dùng
    - item_ids: Danh sách món ăn cần tính điểm (nếu None, lấy tất cả món đang bán)
    - search_keyword: Từ khóa tìm kiếm
    - top_n: Số lượng gợi ý trả về
    - weights: Dict trọng số cho từng phương pháp
      {
        'collaborative': 0.3,
        'content': 0.25,
        'chatbot': 0.25,
        'rating': 0.2
      }
    
    Returns: List of {item_id, score, breakdown}
    """
    try:
        # Default weights
        if weights is None:
            weights = {
                'collaborative': 0.30,  # Lọc cộng tác
                'content': 0.25,        # Từ khóa tìm kiếm
                'chatbot': 0.25,        # Ngữ cảnh chatbot
                'rating': 0.20          # Đánh giá sao
            }
        
        # Nếu không có item_ids, lấy tất cả món đang bán
        if item_ids is None:
            conn = get_db_connection()
            query = "SELECT ma_mon FROM mon_an WHERE trang_thai = 1"
            df = pd.read_sql(query, conn)
            conn.close()
            item_ids = df['ma_mon'].tolist()
        
        if not item_ids:
            return []
        
        # Lấy điểm từ 4 phương pháp
        print(f"🔍 Tính điểm cho {len(item_ids)} món ăn...")
        
        collab_scores = get_collaborative_score(user_id, item_ids)
        content_scores = get_content_based_score(search_keyword, item_ids) if search_keyword else {}
        chatbot_scores = get_chatbot_context_score(user_id, item_ids)
        rating_scores = get_rating_based_score(item_ids)
        
        print(f"✅ Collaborative: {len(collab_scores)} items")
        print(f"✅ Content-based: {len(content_scores)} items")
        print(f"✅ Chatbot context: {len(chatbot_scores)} items")
        print(f"✅ Rating-based: {len(rating_scores)} items")
        
        # Tính điểm tổng hợp
        final_scores = []
        for item_id in item_ids:
            # Lấy điểm từ mỗi phương pháp (default 0 nếu không có)
            collab = collab_scores.get(item_id, 0)
            content = content_scores.get(item_id, 0)
            chatbot = chatbot_scores.get(item_id, 0)
            rating = rating_scores.get(item_id, 0)
            
            # Normalize collaborative score (có thể âm hoặc dương)
            # Chuyển về scale 0-1
            if collab_scores:
                min_collab = min(collab_scores.values())
                max_collab = max(collab_scores.values())
                if max_collab > min_collab:
                    collab = (collab - min_collab) / (max_collab - min_collab)
                else:
                    collab = 0.5
            
            # Tính điểm tổng hợp
            total_score = (
                weights['collaborative'] * collab +
                weights['content'] * content +
                weights['chatbot'] * chatbot +
                weights['rating'] * rating
            )
            
            final_scores.append({
                'item_id': item_id,
                'score': total_score,
                'breakdown': {
                    'collaborative': round(collab, 3),
                    'content': round(content, 3),
                    'chatbot': round(chatbot, 3),
                    'rating': round(rating, 3)
                }
            })
        
        # Sắp xếp theo điểm
        final_scores = sorted(final_scores, key=lambda x: x['score'], reverse=True)
        
        return final_scores[:top_n]
        
    except Exception as e:
        print(f"❌ Lỗi get_hybrid_recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    # Test
    print("🧪 Testing Hybrid Recommendation System...")
    
    # Test với user_id = 1, tìm kiếm "gà"
    results = get_hybrid_recommendations(
        user_id=1,
        search_keyword="gà",
        top_n=5
    )
    
    print("\n📊 Kết quả gợi ý:")
    for i, item in enumerate(results, 1):
        print(f"{i}. Item {item['item_id']}: Score = {item['score']:.3f}")
        print(f"   Breakdown: {item['breakdown']}")

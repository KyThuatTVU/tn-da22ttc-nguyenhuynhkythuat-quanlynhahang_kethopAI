"""
Script test hệ thống gợi ý lai ghép
"""

import requests
import json

# Cấu hình
API_BASE = "http://localhost:5000/api/ml"

def test_hybrid_recommendation():
    print("=" * 60)
    print("🧪 TEST HỆ THỐNG GỢI Ý LAI GHÉP")
    print("=" * 60)
    
    # Test 1: Gợi ý cơ bản (không có từ khóa)
    print("\n📋 Test 1: Gợi ý cơ bản cho user_id=1")
    print("-" * 60)
    
    response = requests.get(f"{API_BASE}/recommend/hybrid", params={
        'user_id': 1,
        'limit': 5
    })
    
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Success: {data.get('success')}")
    print(f"Message: {data.get('message')}")
    
    if data.get('data'):
        print(f"\n📊 Kết quả ({len(data['data'])} món):")
        for i, item in enumerate(data['data'], 1):
            print(f"\n{i}. Item ID: {item['item_id']}")
            print(f"   Score: {item['score']:.3f}")
            print(f"   Breakdown:")
            for method, score in item['breakdown'].items():
                print(f"     - {method:15s}: {score:.3f}")
    
    # Test 2: Gợi ý với từ khóa "gà"
    print("\n" + "=" * 60)
    print("📋 Test 2: Gợi ý với từ khóa 'gà'")
    print("-" * 60)
    
    response = requests.get(f"{API_BASE}/recommend/hybrid", params={
        'user_id': 1,
        'keyword': 'gà',
        'limit': 5
    })
    
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Success: {data.get('success')}")
    
    if data.get('data'):
        print(f"\n📊 Kết quả ({len(data['data'])} món):")
        for i, item in enumerate(data['data'], 1):
            print(f"\n{i}. Item ID: {item['item_id']}")
            print(f"   Score: {item['score']:.3f}")
            print(f"   Content score: {item['breakdown']['content']:.3f} (từ khóa)")
    
    # Test 3: Tùy chỉnh trọng số (ưu tiên rating)
    print("\n" + "=" * 60)
    print("📋 Test 3: Tùy chỉnh trọng số (ưu tiên rating 50%)")
    print("-" * 60)
    
    response = requests.get(f"{API_BASE}/recommend/hybrid", params={
        'user_id': 1,
        'keyword': 'lẩu',
        'limit': 5,
        'w_rating': 0.5,
        'w_collab': 0.2,
        'w_content': 0.2,
        'w_chatbot': 0.1
    })
    
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Weights used: {json.dumps(data.get('weights_used'), indent=2)}")
    
    if data.get('data'):
        print(f"\n📊 Kết quả ({len(data['data'])} món):")
        for i, item in enumerate(data['data'], 1):
            print(f"\n{i}. Item ID: {item['item_id']}")
            print(f"   Score: {item['score']:.3f}")
            print(f"   Rating score: {item['breakdown']['rating']:.3f} (ưu tiên)")
    
    # Test 4: So sánh với Collaborative thuần
    print("\n" + "=" * 60)
    print("📋 Test 4: So sánh Hybrid vs Collaborative thuần")
    print("-" * 60)
    
    # Hybrid
    hybrid_response = requests.get(f"{API_BASE}/recommend/hybrid", params={
        'user_id': 1,
        'limit': 5
    })
    hybrid_data = hybrid_response.json()
    
    # Collaborative
    collab_response = requests.get(f"{API_BASE}/recommend/collaborative", params={
        'user_id': 1,
        'limit': 5
    })
    collab_data = collab_response.json()
    
    print("\n🔵 Hybrid Recommendations:")
    if hybrid_data.get('data'):
        for item in hybrid_data['data'][:3]:
            print(f"  - Item {item['item_id']}: {item['score']:.3f}")
    
    print("\n🟢 Collaborative Only:")
    if collab_data.get('data'):
        for item in collab_data['data'][:3]:
            print(f"  - Item {item['item_id']}: {item['score']:.3f}")
    
    print("\n" + "=" * 60)
    print("✅ HOÀN THÀNH TEST")
    print("=" * 60)

def test_individual_components():
    """Test từng component riêng lẻ"""
    print("\n" + "=" * 60)
    print("🔬 TEST TỪNG COMPONENT")
    print("=" * 60)
    
    from hybrid_recommendation import (
        get_collaborative_score,
        get_content_based_score,
        get_chatbot_context_score,
        get_rating_based_score
    )
    
    user_id = 1
    item_ids = [1, 2, 3, 4, 5, 10, 15, 20]
    
    print(f"\nTest với user_id={user_id}, items={item_ids}")
    
    # Test Collaborative
    print("\n1️⃣ Collaborative Filtering:")
    collab_scores = get_collaborative_score(user_id, item_ids)
    for item_id, score in list(collab_scores.items())[:5]:
        print(f"   Item {item_id}: {score:.3f}")
    
    # Test Content-based
    print("\n2️⃣ Content-based (keyword='gà'):")
    content_scores = get_content_based_score('gà', item_ids)
    for item_id, score in list(content_scores.items())[:5]:
        print(f"   Item {item_id}: {score:.3f}")
    
    # Test Chatbot context
    print("\n3️⃣ Chatbot Context:")
    chatbot_scores = get_chatbot_context_score(user_id, item_ids)
    for item_id, score in list(chatbot_scores.items())[:5]:
        print(f"   Item {item_id}: {score:.3f}")
    
    # Test Rating-based
    print("\n4️⃣ Rating-based:")
    rating_scores = get_rating_based_score(item_ids)
    for item_id, score in list(rating_scores.items())[:5]:
        print(f"   Item {item_id}: {score:.3f}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--components':
        test_individual_components()
    else:
        try:
            test_hybrid_recommendation()
        except requests.exceptions.ConnectionError:
            print("❌ Không thể kết nối đến AI service!")
            print("Hãy chạy: python app.py")
            print("\nHoặc test từng component với: python test_hybrid.py --components")

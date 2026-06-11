"""
Script: Test các ngưỡng Apriori khác nhau
Chạy: python ai_service/test_apriori_thresholds.py
"""

from apriori_service import train_apriori_model
import pickle
import os

print("="*60)
print("🧪 TEST CÁC NGƯỠNG APRIORI")
print("="*60)

# Test 1: Ngưỡng hiện tại (lỏng)
print("\n📊 TEST 1: min_confidence=10% (Lỏng - Nhiều luật)")
print("-"*60)
train_apriori_model(min_support=0.01, min_confidence=0.1)

# Đọc kết quả
model_path = os.path.join(os.path.dirname(__file__), 'models', 'apriori_rules.pkl')
if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        rules = pickle.load(f)
    
    total_rules = sum(len(v) for v in rules.values())
    print(f"\n✅ Kết quả: {len(rules)} món gốc, {total_rules} luật")
    
    # Show top 5 rules
    print("\n📋 Top 5 luật:")
    all_rules = []
    for ant_id, consequents in rules.items():
        for cons in consequents:
            all_rules.append({
                'ant': ant_id,
                'cons': cons['item_id'],
                'conf': cons['confidence'],
                'lift': cons['lift']
            })
    all_rules.sort(key=lambda x: x['conf'], reverse=True)
    
    for i, rule in enumerate(all_rules[:5], 1):
        print(f"{i}. Món {rule['ant']} → Món {rule['cons']}")
        print(f"   Confidence: {rule['conf']*100:.1f}%, Lift: {rule['lift']:.2f}x")

# Test 2: Ngưỡng trung bình
print("\n\n📊 TEST 2: min_confidence=50% (Trung bình)")
print("-"*60)
train_apriori_model(min_support=0.02, min_confidence=0.5)

if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        rules = pickle.load(f)
    
    total_rules = sum(len(v) for v in rules.values())
    print(f"\n✅ Kết quả: {len(rules)} món gốc, {total_rules} luật")

# Test 3: Ngưỡng chặt (theo yêu cầu)
print("\n\n📊 TEST 3: min_confidence=80% (Chặt chẽ)")
print("-"*60)
train_apriori_model(min_support=0.03, min_confidence=0.8)

if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        rules = pickle.load(f)
    
    total_rules = sum(len(v) for v in rules.values())
    print(f"\n✅ Kết quả: {len(rules)} món gốc, {total_rules} luật")
    
    if total_rules > 0:
        print("\n📋 Tất cả luật với confidence >= 80%:")
        all_rules = []
        for ant_id, consequents in rules.items():
            for cons in consequents:
                all_rules.append({
                    'ant': ant_id,
                    'cons': cons['item_id'],
                    'conf': cons['confidence'],
                    'lift': cons['lift']
                })
        all_rules.sort(key=lambda x: x['conf'], reverse=True)
        
        for i, rule in enumerate(all_rules, 1):
            print(f"{i}. Món {rule['ant']} → Món {rule['cons']}")
            print(f"   Confidence: {rule['conf']*100:.1f}%, Lift: {rule['lift']:.2f}x")
    else:
        print("\n⚠️ KHÔNG CÓ LUẬT NÀO với confidence >= 80%")
        print("   → Có thể do:")
        print("     1. Chưa đủ đơn hàng")
        print("     2. Khách hàng mua món khá ngẫu nhiên")
        print("     3. Cần giảm ngưỡng xuống 60-70%")

print("\n"+"="*60)
print("💡 KHUYẾN NGHỊ:")
print("="*60)
print("✅ min_confidence=50-60%: Cân bằng giữa độ chính xác và số lượng")
print("✅ min_confidence=70-80%: Chặt chẽ, chỉ đề xuất khi chắc chắn")
print("❌ min_confidence=10-30%: Quá lỏng, có thể đề xuất sai")
print("="*60)

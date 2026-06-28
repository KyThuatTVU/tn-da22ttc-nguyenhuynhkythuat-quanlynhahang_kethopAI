import os
import sys
import mysql.connector
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
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

# Load env variables from backend
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

def retrieve_knowledge(question, top_n=2, threshold=0.05):
    """
    Retrieve top matching knowledge entries from chatbot_tri_thuc table using TF-IDF and Cosine Similarity.
    """
    safe_print(f"🔍 RAG retrieving knowledge for: '{question}'")
    try:
        # 1. Fetch data from DB
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, tieu_de, noi_dung FROM chatbot_tri_thuc")
        documents = cursor.fetchall()
        cursor.close()
        conn.close()

        if not documents:
            safe_print("⚠️ Knowledge base is empty.")
            return []

        # 2. Prepare corpus (combine title and content for better matching)
        corpus = []
        doc_map = []
        for doc in documents:
            combined_text = f"{doc['tieu_de']} {doc['noi_dung']}"
            corpus.append(combined_text)
            doc_map.append(doc)

        # 3. Add question to vectorizer inputs
        # We need to compute TF-IDF vectors
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # Transform question
        question_vector = vectorizer.transform([question])

        # 4. Calculate Cosine Similarity
        similarities = cosine_similarity(question_vector, tfidf_matrix).flatten()

        # 5. Extract top matching documents
        results = []
        for idx, score in enumerate(similarities):
            if score >= threshold:
                doc = doc_map[idx]
                results.append({
                    "id": doc["id"],
                    "tieu_de": doc["tieu_de"],
                    "noi_dung": doc["noi_dung"],
                    "score": float(score)
                })

        # Sort by similarity score descending
        results = sorted(results, key=lambda x: x["score"], reverse=True)
        
        safe_print(f"✅ RAG retrieved {len(results[:top_n])} documents out of {len(documents)} available.")
        for r in results[:top_n]:
            safe_print(f"   - [{r['id']}] {r['tieu_de']} (Score: {r['score']:.4f})")
            
        return results[:top_n]

    except Exception as e:
        safe_print(f"❌ Error in RAG retrieval service: {str(e)}")
        return []

if __name__ == "__main__":
    # Test execution
    res = retrieve_knowledge("Ai là chủ nhà hàng?")
    safe_print(res)

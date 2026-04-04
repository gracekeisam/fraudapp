import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

test_data = {
    "transaction_id": "test_txn_1",
    "utr": "test_utr_1",
    "amount": 100,
    "vpa": "test@upi",
    "status": "SUCCESS",
    "timestamp": "2024-03-31T05:00:00Z",
    "latitude": 12.34,
    "longitude": 56.78,
    "device_model": "Phone",
    "brand": "Apple"
}

try:
    res = supabase.table("transactions").insert(test_data).execute()
    print("SUCCESS!", res)
except Exception as e:
    print("FAILED!", str(e))

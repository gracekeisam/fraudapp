from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import socket
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()  # Load variables from .env if present

# --- SUPABASE CONFIG ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[Supabase] Connected to remote database.")
    except Exception as e:
        print(f"[Supabase] Failed to initialize: {e}")

# --- DATA PERSISTENCE ---
DATA_FILE = "transactions.csv"

def get_lan_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except Exception:
        return "127.0.0.1"

def save_to_csv(data):
    df = pd.DataFrame([data])
    if not os.path.isfile(DATA_FILE):
        df.to_csv(DATA_FILE, index=False)
    else:
        df.to_csv(DATA_FILE, mode='a', header=False, index=False)

# --- FASTAPI RECEIVER ---
app = FastAPI()

# Enable CORS for the mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace with your own key or leave as None to disable security
EXPECTED_API_KEY = os.getenv("UPI_API_KEY", None)

@app.post("/report")
async def report_transaction(request: Request):
    try:
        # Check for API Key if configured
        if EXPECTED_API_KEY:
            auth_header = request.headers.get("Authorization")
            if not auth_header or auth_header != f"Bearer {EXPECTED_API_KEY}":
                print("⚠️ [API] Unauthorized request blocked")
                return {"status": "error", "message": "Unauthorized"}

        payload = await request.json()
        
        # Flatten the payload for CSV
        flattened_data = {
            "transaction_id": payload.get("transaction_id"),
            "utr": payload.get("utr"),
            "amount": payload.get("amount"),
            "vpa": payload.get("vpa"),
            "status": payload.get("status"),
            "timestamp": payload.get("timestamp"),
            "latitude": payload.get("location", {}).get("latitude") if payload.get("location") else None,
            "longitude": payload.get("location", {}).get("longitude") if payload.get("location") else None,
            "device_model": payload.get("device_info", {}).get("model") if payload.get("device_info") else "Unknown",
            "brand": payload.get("device_info", {}).get("brand") if payload.get("device_info") else "Unknown",
        }
        
        save_to_csv(flattened_data)
        
        # Optionally, save to Supabase if configured 
        if supabase:
            try:
                # We format datetime to ISO string for Postgres compatibility
                sb_data = flattened_data.copy()
                supabase.table("transactions").insert(sb_data).execute()
            except Exception as sb_e:
                print(f" [Supabase] Failed to insert row: {sb_e}")
                
        print(f"[API] Received transaction from {flattened_data['vpa']} for ₹{flattened_data['amount']}")
        return {"status": "success", "message": "Transaction reported"}
    except Exception as e:
        print(f"[API] Error processing request: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8000
    lan_ip = get_lan_ip()

    print("\nStarting UPI Receiver API...")
    print(f"Listening on {host}:{port}")
    print("Use one of these endpoints in the mobile app:")
    print(f"- Same computer / iOS simulator: http://127.0.0.1:{port}/report")
    print(f"- Android emulator: http://10.0.2.2:{port}/report")
    print(f"- Physical device on the same Wi-Fi: http://{lan_ip}:{port}/report")
    uvicorn.run(app, host=host, port=port)

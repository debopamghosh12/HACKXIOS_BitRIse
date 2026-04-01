import os
import random
import time
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from thefuzz import process

# --- 1. SETUP & CONFIG ---
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("❌ SUPABASE_URL or SUPABASE_KEY is missing in .env file!")

supabase: Client = create_client(url, key)

app = FastAPI(title="HealthTech Hackathon API", version="6.0 (Routine Feature Added)")

# --- 🔥 CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATA MODELS ---

class SignupInput(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str
    address: str

class LoginInput(BaseModel):
    email: str
    password: str

class PrescriptionInput(BaseModel):
    ocr_text: str

class SubscriptionInput(BaseModel):
    user_id: str
    medicine_id: int
    quantity: int
    dosage_per_day: int

class PaymentInput(BaseModel):
    user_id: str
    subscription_id: int
    amount: float

# 🆕 New Model for Routine
class RoutineInput(BaseModel):
    user_id: str
    medicine_name: str
    reminder_time: str  # Example: "08:00 AM"

# --- 3. HELPER FUNCTIONS ---
def calculate_refill_date(quantity, dosage_per_day):
    if dosage_per_day <= 0: dosage_per_day = 1
    days_to_last = quantity // dosage_per_day
    buffer_days = 3
    refill_date = datetime.now() + timedelta(days=max(1, days_to_last - buffer_days))
    return refill_date.strftime("%Y-%m-%d")

# --- 4. API ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "HealthTech Backend Live! 🚀 Features: Auth, Scan, Search, Pay, Routines"}

# 📝 Feature 0: User Sign Up
@app.post("/signup")
def signup_user(data: SignupInput):
    print(f"[SIGNUP] Registering: {data.email}")
    try:
        auth_response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
        
        if not auth_response.user:
             raise HTTPException(status_code=400, detail="Registration failed. Check email confirmation settings.")

        user_id = auth_response.user.id
        
        supabase.table('users').insert({
            "id": user_id,
            "full_name": data.full_name,
            "phone_number": data.phone
        }).execute()
        
        return {"status": "success", "message": "User Registered! Please Login."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 🔐 Feature 1: User Login
@app.post("/login")
def login_user(data: LoginInput):
    print(f"[LOGIN] Logging in: {data.email}")
    try:
        session = supabase.auth.sign_in_with_password({
            "email": data.email, 
            "password": data.password
        })
        user = session.user
        token = session.session.access_token
        
        profile = supabase.table('patients').select('*').eq('id', user.id).execute()
        
        return {
            "status": "success",
            "message": "Login Successful!",
            "user_id": user.id,
            "access_token": token,
            "profile": profile.data[0] if profile.data else {}
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Email or Password")

# 🔍 Feature 2: Search Medicines
@app.get("/search-medicine")
def search_medicine(query: str):
    print(f"[SEARCH] Searching: {query}")
    try:
        response = supabase.table('medicines').select('id, brand_name, issue_solved, net_qty, price').ilike('brand_name', f"%{query}%").limit(20).execute()
        print(f"[SEARCH] Found {len(response.data)} medicines")
        for medicine in response.data:
            print(f"  - {medicine.get('brand_name')}: ₹{medicine.get('price')}")
        return {"status": "success", "count": len(response.data), "results": response.data}
    except Exception as e:
        print(f"[SEARCH] Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# 🧠 Feature 3: AI Prescription Scanner
@app.post("/scan-prescription")
def scan_prescription(data: PrescriptionInput):
    print(f"[SCAN] Scanning Text: {data.ocr_text}")
    response = supabase.table('medicines').select('brand_name, med_id, price').limit(1000).execute()
    all_meds = {item['brand_name']: item for item in response.data}
    match_score = process.extractOne(data.ocr_text, list(all_meds.keys()))
    
    if match_score and match_score[1] > 80:
        found = all_meds[match_score[0]]
        return {"status": "success", "medicine": found['brand_name'], "medicine_id": found['med_id'], "price": found['price'], "confidence": match_score[1]}
    else:
        return {"status": "failed", "message": "Medicine not found in database."}

# 📅 Feature 4: Create Subscription
@app.post("/create-subscription")
def create_subscription(data: SubscriptionInput):
    next_refill = calculate_refill_date(data.quantity, data.dosage_per_day)
    try:
        supabase.table('subscriptions').insert({
            "patient_id": data.user_id,
            "medicine_id": data.medicine_id,
            "quantity_per_order": data.quantity,
            "dosage_per_day": data.dosage_per_day,
            "next_refill_date": next_refill,
            "status": "active"
        }).execute()
        return {"status": "success", "message": "Subscription Active!", "next_refill_date": next_refill}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 💳 Feature 5: Payment
@app.post("/process-payment")
def process_payment(data: PaymentInput):
    time.sleep(1)
    txn_id = f"TXN_{random.randint(100000, 999999)}_HACK"
    try:
        supabase.table('payments').insert({
            "patient_id": data.user_id,
            "subscription_id": data.subscription_id,
            "amount": data.amount,
            "transaction_id": txn_id
        }).execute()
        return {"status": "success", "txn_id": txn_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 📱 Feature 6: Dashboard
@app.get("/my-dashboard/{user_id}")
def get_dashboard(user_id: str):
    response = supabase.table('subscriptions').select('*, medicines(*)').eq('patient_id', user_id).execute()
    return {"active_subscriptions": response.data}

# ⏰ Feature 7: Add Medicine Routine (NEW)
@app.post("/add-routine")
def add_routine(data: RoutineInput):
    try:
        supabase.table('routines').insert({
            "patient_id": data.user_id,
            "medicine_name": data.medicine_name,
            "reminder_time": data.reminder_time
        }).execute()
        return {"status": "success", "message": f"Reminder set for {data.medicine_name} at {data.reminder_time}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ⏰ Feature 8: Get User Routines (NEW)
@app.get("/get-routines/{user_id}")
def get_routines(user_id: str):
    try:
        response = supabase.table('routines').select('*').eq('patient_id', user_id).execute()
        return {"status": "success", "routines": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
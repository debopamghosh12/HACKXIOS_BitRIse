import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase_auth.errors import AuthApiError

# 1. Load Secrets (Added .strip() to remove accidental spaces in .env)
load_dotenv()
url: str = os.environ.get("SUPABASE_URL").strip()
key: str = os.environ.get("SUPABASE_KEY").strip()

if not url or not key:
    print("❌ Error: .env details missing!")
    exit()

supabase: Client = create_client(url, key)

def calculate_refill_date(quantity, dosage_per_day):
    days_to_last = quantity // dosage_per_day
    buffer_days = 3
    refill_date = datetime.now() + timedelta(days=days_to_last - buffer_days)
    return refill_date.strftime("%Y-%m-%d")

def main():
    print("--- 🏥 Starting HealthTech Smart Order Test (Attempt 2) ---")

    # Step A: Create User
    # Changed domain to @example.com to avoid spam filters
    random_id = random.randint(1000, 9999)
    email = f"patient{random_id}@example.com" 
    password = "StrongPassword123!" # Stronger password just in case

    print(f"1. Creating User: {email}...")
    
    try:
        auth_response = supabase.auth.sign_up({
            "email": email, 
            "password": password,
            "options": {
                "data": { "full_name": f"Test Patient {random_id}" } 
            }
        })
        
        # Check if user object exists
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"   ✅ User Created! ID: {user_id}")
        else:
            print("   ⚠️ User created but no ID returned (Check Confirm Email setting!)")
            return

    except Exception as e:
        print(f"   ❌ Signup Failed: {e}")
        return

    # Step B: Create Patient Profile
    print("2. Creating Patient Profile in DB...")
    try:
        supabase.table('patients').insert({
            "id": user_id,
            "full_name": f"Test Patient {random_id}",
            "phone": "9876543210"
        }).execute()
    except Exception as e:
        print(f"   ⚠️ Patient profile might already exist: {e}")

    # Step C: Smart Subscription
    print("3. Calculating Smart Refill Date...")
    medicine_id = 2 
    qty = 60
    dosage = 2
    next_refill = calculate_refill_date(qty, dosage)
    
    print(f"   -> Based on {qty} pills & {dosage}/day, Next Refill is: {next_refill}")

    print("4. Saving Subscription...")
    try:
        data = supabase.table('subscriptions').insert({
            "patient_id": user_id,
            "medicine_id": medicine_id,
            "quantity_per_order": qty,
            "dosage_per_day": dosage,
            "next_refill_date": next_refill,
            "status": "active"
        }).execute()
        print("✅ SUCCESS! Smart Subscription Created.")
        print(data)
    except Exception as e:
        print(f"❌ Database Insert Failed: {e}")

if __name__ == "__main__":
    main()
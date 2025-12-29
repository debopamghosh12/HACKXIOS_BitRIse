import os
import time
import random
from dotenv import load_dotenv
from supabase import create_client, Client

# Load Secrets
load_dotenv()
url: str = os.environ.get("SUPABASE_URL").strip()
key: str = os.environ.get("SUPABASE_KEY").strip()
supabase: Client = create_client(url, key)

def process_payment(user_id, subscription_id, medicine_price, quantity):
    print("\n--- 💳 Initiating Payment Gateway ---")
    
    # 1. Calculate Total Amount
    total_amount = medicine_price * quantity
    print(f"   💵 Bill Amount: ₹{total_amount} (Rate: ₹{medicine_price} x {quantity} qty)")
    
    # 2. Simulate Bank Processing Delay (Mocking Real Life)
    print("   🔄 Contacting Bank Server...", end="", flush=True)
    time.sleep(2) # Fake loading time
    print(" Connected!")
    
    # 3. Generate Fake Transaction ID
    txn_id = f"TXN_{random.randint(100000, 999999)}_HACK"
    
    # 4. Save to Database
    print(f"   📝 Generating Receipt: {txn_id}...")
    
    try:
        data = supabase.table('payments').insert({
            "patient_id": user_id,
            "subscription_id": subscription_id,
            "amount": total_amount,
            "transaction_id": txn_id,
            "payment_method": "UPI",
            "status": "success"
        }).execute()
        
        print("\n✅ PAYMENT SUCCESSFUL!")
        print(f"   Receipt Saved. Transaction ID: {txn_id}")
        return True
        
    except Exception as e:
        print(f"❌ Payment Failed: {e}")
        return False

def main():
    # 1. First, fetch the Active Subscription we created earlier
    print("🔍 Searching for pending bills...")
    response = supabase.table('subscriptions').select('*, medicines(*)').eq('status', 'active').execute()
    
    if not response.data:
        print("No active subscriptions found to pay for!")
        return

    # Let's pay for the first one found
    sub = response.data[0]
    
    user_id = sub['patient_id']
    sub_id = sub['id']
    price = sub['medicines']['price'] # Auto-fetched from Medicine Table
    qty = sub['quantity_per_order']
    med_name = sub['medicines']['name']

    print(f"Found Bill for: {med_name}")
    
    # 2. Call the payment function
    process_payment(user_id, sub_id, price, qty)

if __name__ == "__main__":
    main()
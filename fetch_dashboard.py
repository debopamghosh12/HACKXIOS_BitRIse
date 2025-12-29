import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Load Secrets
load_dotenv()
url: str = os.environ.get("SUPABASE_URL").strip()
key: str = os.environ.get("SUPABASE_KEY").strip()
supabase: Client = create_client(url, key)

def main():
    print("--- 📱 Generating User Dashboard Data ---")

    # The Magic Query:
    # select = '*, medicines(*)' means:
    # "Get everything from Subscriptions AND fetch the connected Medicine details too!"
    
    try:
        response = supabase.table('subscriptions').select('*, medicines(*)').execute()
        
        subscriptions = response.data
        
        print(f"\nFound {len(subscriptions)} Active Subscriptions:\n")
        
        for sub in subscriptions:
            # Data extraction
            med_name = sub['medicines']['name']
            refill_date = sub['next_refill_date']
            status = sub['status']
            
            # This is what you show on the App Dashboard
            print(f"📦 Order Summary:")
            print(f"   💊 Medicine: {med_name}")
            print(f"   📅 Next Auto-Order: {refill_date}")
            print(f"   ⚡ Status: {status}")
            print("-" * 30)

    except Exception as e:
        print(f"❌ Error fetching data: {e}")

if __name__ == "__main__":
    main()
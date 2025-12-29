import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load secrets
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Initialize connection
supabase: Client = create_client(url, key)

if __name__ == "__main__":
    print(f"✅ Connected to Supabase at: {url}")
    print("Dominian, we are ready to rock! 🚀")
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from thefuzz import process # Magic library for text matching

# Load Secrets
load_dotenv()
url: str = os.environ.get("SUPABASE_URL").strip()
key: str = os.environ.get("SUPABASE_KEY").strip()
supabase: Client = create_client(url, key)

def analyze_prescription_text(ocr_text):
    print("\n--- 🤖 AI Doctor Analysis ---")
    print(f"📄 Scanned Text: '{ocr_text}'")
    
    # 1. Fetch all medicine names from DB
    response = supabase.table('medicines').select('name, id').execute()
    all_meds = {item['name']: item['id'] for item in response.data}
    medicine_names = list(all_meds.keys())
    
    # 2. Find the best match using Fuzzy Logic
    # It looks for the medicine name inside the messy text
    print("🔍 Scanning database for matches...")
    
    # We check if any medicine name resembles words in the text
    found_medicine = None
    highest_score = 0
    
    for med in medicine_names:
        # Check how closely the med name appears in the text
        match_score = process.extractOne(med, [ocr_text])
        
        # If match is > 80%, we are confident
        if match_score[1] > 80:
            print(f"   -> Found Potential Match: {med} (Confidence: {match_score[1]}%)")
            if match_score[1] > highest_score:
                highest_score = match_score[1]
                found_medicine = med

    if found_medicine:
        print(f"✅ DETECTED MEDICINE: {found_medicine}")
        return all_meds[found_medicine]
    else:
        print("❌ No clear medicine found. Please try again.")
        return None

def main():
    # Simulate an Uploaded Prescription (OCR Output)
    # Notice the spelling mistake: 'Metforminn' and messy text
    fake_ocr_output = "Dr. Roy. Rx: Take Metforminn 500mg twice daily after food."
    
    med_id = analyze_prescription_text(fake_ocr_output)
    
    if med_id:
        print(f"🎉 System is ready to create order for Medicine ID: {med_id}")
        # Here you would call the subscription function we made earlier!

if __name__ == "__main__":
    main()
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = 'legal-docs'
LOCAL_FOLDER = 'downloaded_pdfs'

def download_all_files(LOCAL_FOLDER):
    # Create local folder if it doesn't exist
    os.makedirs(LOCAL_FOLDER, exist_ok=True)

    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # List all files in the bucket
    files = supabase.storage.from_(BUCKET_NAME).list()

    for file in files:
        filename = file['name']
        if filename == '.emptyFolderPlaceholder':
            continue
        print(f"Downloading {filename} ...")
        res = supabase.storage.from_(BUCKET_NAME).download(filename)
        if res:
            local_path = os.path.join(LOCAL_FOLDER, filename)
            with open(local_path, 'wb') as f:
                f.write(res)
        else:
            print(f"Failed to download {filename}")

if __name__ == "__main__":
    download_all_files(LOCAL_FOLDER)            

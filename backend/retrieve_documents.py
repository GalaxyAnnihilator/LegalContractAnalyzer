import os
from supabase import create_client, Client

SUPABASE_URL = 'https://xutirujbqolvqajzipjp.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dGlydWpicW9sdnFhanppcGpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2ODAwNywiZXhwIjoyMDY4NzQ0MDA3fQ.1cNOFUqZzf4j3WKjy7_XTOfbXcwBj2FLWChVJLsmVBc'
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

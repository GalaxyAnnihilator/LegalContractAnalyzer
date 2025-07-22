const SUPABASE_URL = 'https://xutirujbqolvqajzipjp.supabase.co';
const SUPABASE_KEY =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dGlydWpicW9sdnFhanppcGpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2ODAwNywiZXhwIjoyMDY4NzQ0MDA3fQ.1cNOFUqZzf4j3WKjy7_XTOfbXcwBj2FLWChVJLsmVBc';
const bucketName = 'legal-docs';

const supabase_client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("Succesfully created a supabase client")

// Upload a PDF file
async function uploadPDF(file) {
  const { data, error } = await supabase_client
    .storage
    .from(bucketName)
    .upload(file.name, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) console.error("Upload error:", error);
  else console.log("Uploaded:", data);
}

// List all PDFs
async function listPDFs() {
  const { data, error } = await supabase_client
    .storage
    .from(bucketName)
    .list();

  if (error) {
    console.error("List error:", error);
  } else {
    console.log("Files:", data);
    return data;
  }
}

// Download a PDF
async function downloadPDF(filename) {
  const { data, error } = await supabase_client
    .storage
    .from(bucketName)
    .download(filename);

  if (error) {
    console.error("Download error:", error);
  } else {
    const url = URL.createObjectURL(data);
    window.open(url, "_blank");
  }
}

// Delete a PDF
async function deletePDF(filename) {
  const { data, error } = await supabase_client
    .storage
    .from(bucketName)
    .remove([filename]);

  if (error) console.error("Delete error:", error);
  else console.log("Deleted:", data);
}

async function getPublicPDFUrl(filename){
    const { data, error } = await supabase_client
    .storage
    .from(bucketName)
    .getPublicUrl(filename);

  if (error) {
    console.error("URL Retrieval error:", error);
  } else {
    return data.publicUrl;
  }
}
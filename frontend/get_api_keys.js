//Stupid language that doesnt allow API key storage in .env file, now i have to expose a whole backend GET method just to get the stupid api keys so then no one would attack my server, which is not too bad i guess xD

async function fetchApiKeys() {
  try {
    const response = await fetch("http://localhost:3012/api_key");
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const keys = await response.json();
    return keys;
  } catch (err) {
    console.error("❌ Failed to retrieve API keys:", err);
  }
}
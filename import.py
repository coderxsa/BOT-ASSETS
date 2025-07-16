import requests
import zipfile
import os
from pathlib import Path
from tqdm import tqdm
import time

# 👇 USER: Set your GitHub repo URL here
repo_url = "https://github.com/coderxsaa/NEBULA"  # ← CHANGE THIS URL

# --- No changes needed below this line ---
if not repo_url.startswith("https://github.com/"):
    print("❌ Invalid GitHub URL.")
    exit(1)

# Convert to ZIP download URL
zip_url = repo_url.rstrip("/") + "/archive/refs/heads/main.zip"

repo_name = repo_url.rstrip("/").split("/")[-1]
timestamp = int(time.time())
extract_dir = Path("downloads") / f"{repo_name}_{timestamp}"

try:
    os.makedirs(extract_dir, exist_ok=True)
    zip_path = extract_dir / "repo.zip"

    print(f"\n📥 Downloading ZIP from: {zip_url}")
    response = requests.get(zip_url, stream=True)
    response.raise_for_status()

    # Save ZIP to file
    with open(zip_path, "wb") as f:
        for chunk in tqdm(response.iter_content(chunk_size=8192), desc="Downloading", unit="KB"):
            if chunk:
                f.write(chunk)

    print(f"✅ ZIP saved to: {zip_path}")

    # Extract it
    print(f"📦 Extracting to: {extract_dir}")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)

    print("\n📂 Extracted files:")
    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            print(" -", os.path.relpath(os.path.join(root, file), extract_dir))

except Exception as e:
    print("❌ Error:", e)

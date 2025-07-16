import requests
import zipfile
import os
import shutil
import time
from pathlib import Path
from tqdm import tqdm

# --- USER: GitHub repo URL here ---
repo_url = ""  # ✅ Change this if needed || Example: https://github.com/coderxsa/NEBULA


if not repo_url.startswith("https://github.com/"):
    print("❌ Invalid GitHub URL.")
    exit(1
zip_url = repo_url.rstrip("/") + "/archive/refs/heads/main.zip"
repo_name = repo_url.rstrip("/").split("/")[-1]
timestamp = int(time.time())
temp_dir = Path(f"temp_repo_{timestamp}")
zip_path = temp_dir / "repo.zip"
try:
    os.makedirs(temp_dir, exist_ok=True)
    print(f"\n📥 Downloading ZIP from: {zip_url}")
    response = requests.get(zip_url, stream=True)
    response.raise_for_status()
    with open(zip_path, "wb") as f:
        for chunk in tqdm(response.iter_content(chunk_size=8192), desc="Downloading", unit="KB"):
            if chunk:
                f.write(chunk)
    print(f"✅ ZIP saved to: {zip_path}")
    print("📦 Extracting...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)
    extracted_subfolder = None
    for entry in temp_dir.iterdir():
        if entry.is_dir() and entry.name.startswith(repo_name) and entry.name.endswith("main"):
            extracted_subfolder = entry
            break
    if not extracted_subfolder:
        raise Exception("❌ Could not find extracted subfolder")
    print("📂 Moving files into current directory...")
    for item in extracted_subfolder.iterdir():
        dest = Path.cwd() / item.name
        if dest.exists():
            print(f"⏩ Skipped (already exists): {item.name}")
        else:
            if item.is_dir():
                shutil.copytree(item, dest)
            else:
                shutil.copy2(item, dest)
            print(f"✅ Moved: {item.name}")
    shutil.rmtree(temp_dir)
    print("🧹 Cleanup complete.")
    print("✅ Import finished.")

except Exception as e:
    print("❌ Error:", e)

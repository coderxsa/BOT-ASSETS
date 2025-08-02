const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");

// 🔴 IMPORTANT:
// Replace the URL below with the GitHub ZIP link.
// ❌ Do NOT use .git links!
// ✅ Use this format:
// https://github.com/USERNAME/REPO-NAME/archive/refs/heads/BRANCH.zip
// https://github.com/coderxsa/NEBULA/archive/refs/heads/main.zip
// Make sure to replace *package.json*, *index.js*, or any file that would otherwise be skipped during the import.
// Example:

const ZIP_URL = "";

async function coderxsa() {
    const zipPath = path.join(__dirname, "repo.zip");
    const tempPath = path.join(__dirname, "temp_repo");
    try {
        console.log("📥 Downloading ZIP...");
        const response = await axios({ url: ZIP_URL, responseType: "arraybuffer" });
        fs.writeFileSync(zipPath, response.data);
        console.log("🗜️ Extracting...");
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(tempPath, true);
        fs.unlinkSync(zipPath);
        const extractedDirName = fs.readdirSync(tempPath).find(name => name.endsWith("-main"));
        const extractedDir = path.join(tempPath, extractedDirName);
        console.log("📂 Moving files to main folder (no overwrite)...");
        const items = await fs.readdir(extractedDir);
        for (const item of items) {
            const src = path.join(extractedDir, item);
            const dest = path.join(__dirname, item);

            if (!fs.existsSync(dest)) {
                await fs.copy(src, dest);
                console.log(`✅ Imported: ${item}`);
            } else {
                console.log(`⏩ Skipped (already exists): ${item}`);
            }
        }
        await fs.remove(tempPath);
        console.log("✅ Done.");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

coderxsa();

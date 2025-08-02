const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");

// --- USER SETUP ---
// ❗ Enter GitHub repo URL (NOT .git, NOT zip)
const repo_url = ""; // ✅ Example repo | https://github.com/coderxsa/NEBULA

if (!repo_url.startsWith("https://github.com/")) {
    console.error("❌ Invalid GitHub URL.");
    process.exit(1);
}
const zip_url = repo_url.replace(/\/$/, "") + "/archive/refs/heads/main.zip";
const repo_name = repo_url.split("/").filter(Boolean).pop();
const timestamp = Date.now();
const tempPath = path.join(__dirname, `temp_repo_${timestamp}`);
const zipPath = path.join(tempPath, "repo.zip");
async function coderxsa() {
    try {
        await fs.ensureDir(tempPath);
        console.log(`📥 Downloading ZIP from: ${zip_url}`);
        const response = await axios({ url: zip_url, responseType: "arraybuffer" });
        fs.writeFileSync(zipPath, response.data);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(tempPath, true);
        fs.unlinkSync(zipPath);
        const extractedDirName = fs.readdirSync(tempPath).find(name =>
            name.startsWith(repo_name) && name.includes("main")
        );
        if (!extractedDirName) {
            throw new Error("❌ Could not find extracted folder.");
        }
        const extractedDir = path.join(tempPath, extractedDirName);
        const items = await fs.readdir(extractedDir);
        for (const item of items) {
            const src = path.join(extractedDir, item);
            const dest = path.join(__dirname, item);
            await fs.copy(src, dest, { overwrite: true });
            console.log(`🔁 Replaced or added: ${item}`);
        }

        await fs.remove(tempPath);
        console.log("✅ Import complete. Cleaned up.);
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

coderxsa();

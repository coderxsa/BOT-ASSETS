const axios = require('axios');
const unzipper = require('unzipper');
const fs = require('fs-extra');
const path = require('path');

// Replace this with the GitHub repo URL
const repoUrl = 'https://github.com/coderxsa/NEBULA'; 


(async () => {
    if (!repoUrl.startsWith('https://github.com/')) {
        console.error('Invalid GitHub URL');
        return;
    }
    const zipUrl = repoUrl.endsWith('/')
        ? `${repoUrl}archive/refs/heads/main.zip`
        : `${repoUrl}/archive/refs/heads/main.zip`;
    const repoName = repoUrl.split('/').pop();
    const baseDir = path.join(__dirname, 'downloads');
    const extractDir = path.join(baseDir, `${repoName}_${Date.now()}`);
    try {
        await fs.ensureDir(extractDir);
        const zipPath = path.join(extractDir, 'repo.zip');
        const response = await axios({
            method: 'GET',
            url: zipUrl,
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(zipPath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log(`Downloaded ZIP to: ${zipPath}`);
        await fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractDir }))
            .promise();

        console.log(`Extracted to: ${extractDir}`);
        const allFiles = await fs.readdir(extractDir);
        console.log('Extracted content:');
        console.log(allFiles);
    } catch (err) {
        console.error('Error:', err.message);
    }
})();

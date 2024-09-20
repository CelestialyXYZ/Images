const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Constellation codes
const constellations = ["Sct","Vol","Tuc","UMa","Tri","Vul","Gem","Col","CMi","Cru","CVn","Leo","Lyr","Scl","Mic","PsA","Aql","Cep","Ara","Cam","Cet","Cen","Vel","Cas","Nor","Lib","Lac","Ret","Pyx","Pav","Oph","Lup","Hor","Men","Lep","Sgr","UMi","Ser","Dor","Gru","Her","Cyg","CrA","Lyn","Mon","TrA","Phe","Vir","Sge","CMa","Aur","Cir","Ant","Aqr","And","Boo","Ari","Com","Hya","Del","Crv","Dra","Tau","Oct","Sex","Ind","Mus","Psc","Peg","Tel","Cae","Equ","Eri","Hyi","CrB","LMi","Per","Car","Aps","Cha","Cap","Cnc","For","Crt","Pup","Sco","Ori","Pic"];

// URL templates
const jpgUrlTemplate = 'https://www.iau.org/static/archives/images/screen/<IAU_CODE_LOWERCASE>.jpg';
const pdfUrlTemplate = 'https://www.iau.org/static/public/constellations/pdf/<IAU_CODE_UPPERCASE>.pdf';

// Paths for storing files
const jpgDir = './images/constellations/jpg/';
const pdfDir = './images/constellations/pdf/';

// Ensure directories exist
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Download function for both images and PDFs
const downloadFile = async (url, filePath) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        // Pipe the response data to the file
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
    }
};

// Main function to download images and PDFs
const downloadConstellationFiles = async () => {
    ensureDirExists(jpgDir);
    ensureDirExists(pdfDir);

    for (const code of constellations) {
        const jpgUrl = jpgUrlTemplate.replace('<IAU_CODE_LOWERCASE>', code.toLowerCase());
        const pdfUrl = pdfUrlTemplate.replace('<IAU_CODE_UPPERCASE>', code.toUpperCase());

        const jpgFilePath = path.join(jpgDir, `${code}.jpg`);
        const pdfFilePath = path.join(pdfDir, `${code}.pdf`);

        console.log(`Downloading JPG for ${code} from ${jpgUrl}`);
        await downloadFile(jpgUrl, jpgFilePath);

        console.log(`Downloading PDF for ${code} from ${pdfUrl}`);
        await downloadFile(pdfUrl, pdfFilePath);
    }

    console.log('All files downloaded successfully!');
};

// Execute the download
downloadConstellationFiles();

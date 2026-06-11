const puppeteer = require('puppeteer-core');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function main() {
  const chromePath = 'C:\\Users\\LAURENSIUS\\.cache\\puppeteer\\chrome\\win64-149.0.7827.55\\chrome-win64\\chrome.exe';
  
  if (!fs.existsSync(chromePath)) {
    console.error('Chrome not found at:', chromePath);
    process.exit(1);
  }
  
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Taking screenshots of 14 slides...');

  for (let i = 1; i <= 14; i++) {
    const url = `https://telcom-oca-slides.vercel.app/?slide=${i}#slide-${i}`;
    console.log(`Capturing slide ${i}...`);
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const screenshotPath = path.join(screenshotsDir, `slide-${i}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });
    
    console.log(`Saved slide-${i}.png`);
  }

  await browser.close();
  console.log('All screenshots captured!');

  console.log('Creating PDF...');
  const pdfDoc = await PDFDocument.create();

  for (let i = 1; i <= 14; i++) {
    const screenshotPath = path.join(screenshotsDir, `slide-${i}.png`);
    const imageBytes = fs.readFileSync(screenshotPath);
    const image = await pdfDoc.embedPng(imageBytes);
    
    const pdfPage = pdfDoc.addPage([1920, 1080]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080
    });
    
    console.log(`Added slide ${i} to PDF`);
  }

  const pdfBytes = await pdfDoc.save();
  const pdfPath = path.join(__dirname, '..', 'Telkom_OCA_Project2_Presentation.pdf');
  fs.writeFileSync(pdfPath, pdfBytes);
  
  console.log(`PDF saved to: ${pdfPath}`);
  console.log('Done!');
}

main().catch(console.error);
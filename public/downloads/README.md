# Lead Magnet PDF Generation

## Overview

Three professional lead magnet HTML files have been created in `/public/downloads/`:

1. **landing-page-checklist.html** - 50-point pre-launch audit checklist
2. **utm-naming-guide.html** - Comprehensive UTM naming convention guide
3. **cta-swipe-file.html** - 100+ high-converting CTA examples

## Converting HTML to PDF

### Option 1: Using Browser Print (Recommended for Quick Testing)

1. Open each HTML file in Chrome/Edge
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
3. Select "Save as PDF" as destination
4. Settings:
   - Paper size: A4
   - Margins: Default
   - Scale: 100%
   - Background graphics: Enabled
5. Save as corresponding PDF filename

### Option 2: Using Headless Chrome (Recommended for Production)

Install Puppeteer and run this script:

```bash
npm install puppeteer
```

Create `scripts/generate-pdfs.js`:

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

const files = [
  'landing-page-checklist',
  'utm-naming-guide',
  'cta-swipe-file'
];

(async () => {
  const browser = await puppeteer.launch();

  for (const file of files) {
    const page = await browser.newPage();
    const htmlPath = path.join(__dirname, '..', 'public', 'downloads', `${file}.html`);
    const pdfPath = path.join(__dirname, '..', 'public', 'downloads', `${file}.pdf`);

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    console.log(`Generated ${file}.pdf`);
  }

  await browser.close();
})();
```

Run: `node scripts/generate-pdfs.js`

### Option 3: Using wkhtmltopdf

```bash
# Install wkhtmltopdf
brew install wkhtmltopdf  # Mac
# or download from https://wkhtmltopdf.org/

# Generate PDFs
wkhtmltopdf public/downloads/landing-page-checklist.html public/downloads/landing-page-checklist.pdf
wkhtmltopdf public/downloads/utm-naming-guide.html public/downloads/utm-naming-guide.pdf
wkhtmltopdf public/downloads/cta-swipe-file.html public/downloads/cta-swipe-file.pdf
```

### Option 4: Online Conversion (Quick & Easy)

1. Visit https://www.html2pdf.com/ or https://pdfcrowd.com/
2. Upload each HTML file
3. Download the generated PDF
4. Save to `/public/downloads/`

## File Specifications

All PDFs should meet these specs:
- **Format**: A4 (210 x 297 mm)
- **File size**: Under 5 MB each
- **Quality**: 300 DPI for print-ready
- **Fonts**: Embedded system fonts
- **Colors**: RGB color space
- **Compression**: Medium (balance quality/size)

## Testing Downloads

After generating PDFs, test the download links:

1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000
3. Test each download link:
   - `/downloads/landing-page-checklist.pdf`
   - `/downloads/utm-naming-guide.pdf`
   - `/downloads/cta-swipe-file.pdf`

## ContentUpgrade Component

The ContentUpgrade component has been updated to reference these PDFs:

```typescript
downloadUrl: '/downloads/landing-page-checklist.pdf'
downloadUrl: '/downloads/utm-naming-guide.pdf'
downloadUrl: '/downloads/cta-swipe-file.pdf'
```

## Production Deployment

Before deploying:

1. ✅ Generate all 3 PDFs
2. ✅ Verify file sizes (< 5 MB each)
3. ✅ Test downloads locally
4. ✅ Commit PDFs to repo or upload to CDN
5. ✅ Test downloads on staging
6. ✅ Verify email delivery includes download links

## Notes

- HTML files are kept for easy editing and regeneration
- PDFs should be regenerated whenever content is updated
- Consider automating PDF generation in CI/CD pipeline
- Monitor download analytics to track lead magnet performance

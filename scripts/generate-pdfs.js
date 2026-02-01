#!/usr/bin/env node

/**
 * PDF Generation Script
 *
 * Converts HTML lead magnets to professional PDFs using Puppeteer.
 *
 * Usage:
 *   npm install puppeteer
 *   node scripts/generate-pdfs.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const files = [
  {
    name: 'landing-page-checklist',
    title: 'Landing Page Launch Checklist'
  },
  {
    name: 'utm-naming-guide',
    title: 'UTM Naming Convention Guide'
  },
  {
    name: 'cta-swipe-file',
    title: 'High-Intent CTA Swipe File'
  }
];

async function generatePDFs() {
  console.log('🚀 Starting PDF generation...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const file of files) {
    try {
      console.log(`📄 Processing: ${file.title}`);

      const page = await browser.newPage();
      const htmlPath = path.join(__dirname, '..', 'public', 'downloads', `${file.name}.html`);
      const pdfPath = path.join(__dirname, '..', 'public', 'downloads', `${file.name}.pdf`);

      // Check if HTML file exists
      if (!fs.existsSync(htmlPath)) {
        console.error(`   ❌ HTML file not found: ${htmlPath}`);
        continue;
      }

      // Load HTML file
      await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Generate PDF with optimized settings
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        displayHeaderFooter: false
      });

      // Get file size
      const stats = fs.statSync(pdfPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`   ✅ Generated: ${file.name}.pdf (${fileSizeMB} MB)`);

      await page.close();
    } catch (error) {
      console.error(`   ❌ Error generating ${file.name}.pdf:`, error.message);
    }
  }

  await browser.close();

  console.log('\n✨ PDF generation complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Review PDFs in public/downloads/');
  console.log('   2. Test download links locally');
  console.log('   3. Commit PDFs to repository');
  console.log('   4. Deploy to production\n');
}

// Run the script
generatePDFs().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream(path.resolve(__dirname, './cat.pdf')));

doc.image(path.resolve(__dirname, './images/cat.png'));

doc.save()

doc.end()
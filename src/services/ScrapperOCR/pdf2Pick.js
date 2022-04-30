const { fromPath } = require("pdf2pic");
const { mkdirsSync } = require("fs-extra");
const path = require('path')
const rimraf = require("rimraf");

const pdfPath = path.resolve(__dirname, './ViewPDF.pdf')
const destPath = path.resolve(__dirname, './images/ViewPDF.png')

rimraf.sync(destPath);

mkdirsSync(destPath.replace(path.basename(destPath), ""));

const baseOptions = {
  width: 2550,
  height: 3300,
  density: 330,
  savePath: destPath.replace(path.basename(destPath), ""),
};

fromPath(pdfPath, baseOptions).bulk(-1);

// convert()

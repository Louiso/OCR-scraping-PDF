var PDFImage = require("pdf-image").PDFImage;
const path = require('path')

const pdfPath = path.resolve(__dirname, './ViewPDF.pdf')
const destPath = path.resolve(__dirname, './images/ViewPDF.png')

var pdfImage = new PDFImage(pdfPath);

const main = async () => {
  try {
    console.log("main")
    const imagePath = await pdfImage.convertFile()
    console.log("Luis Sullca ~ file: convertPdfToImage.js ~ line 12 ~ main ~ imagePath", imagePath)
  } catch (error) {
    console.log("error", error)
  } finally {
    console.log("adios")
  }
}

main()
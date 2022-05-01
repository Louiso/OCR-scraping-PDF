const tesseract = require("node-tesseract-ocr")
const path = require('path')

const destPath = path.resolve(__dirname, './images/ViewPDF.png')

const main = async () => {
  try {
    const text1 = await tesseract
      .recognize(path.resolve(__dirname, './images/untitled.1.png'), {
        psm: 6
      })
    console.log("Luis Sullca ~ file: tsrocr1.js ~ line 26 ~ main ~ text1", text1)

    const text2 = await tesseract
      .recognize(path.resolve(__dirname, './images/untitled.2.png'), {
        psm: 6
      })
    console.log("Luis Sullca ~ file: tsrocr1.js ~ line 26 ~ main ~ text2", text2)
      
  } catch (error) {
    console.log("Error", error)
  }
}

main()
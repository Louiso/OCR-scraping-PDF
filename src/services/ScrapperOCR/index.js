const recognize = require('tesseractocr')
const path = require('path')

const destPath = path.resolve(__dirname, './images/ViewPDF.png')

const main = async () => {
  const text = await recognize(destPath)
  console.log('Yay! Text recognized:', text)
}

main()
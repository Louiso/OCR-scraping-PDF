var textract = require('textract');
const path = require('path')

textract.fromUrl(path.resolve(__dirname, './ViewPDF.pdf'), {
  pdftotextOptions: {
    splitPages: true
  }
}, function( error, text ) {
  console.log("error", error)
  console.log("text", text)
})
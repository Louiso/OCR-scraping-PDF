const { exec } = require('child_process');


exec('python src/services/ScrapperOCR/ocr.py -i ./ViewPDF.pdf -o ./doc', (error, stdout, stderr) => {
  if(error) {
    console.log("error", error)
  } else {
    const lines = stdout.split('\n');
    console.log("lines", lines)
  }  
});
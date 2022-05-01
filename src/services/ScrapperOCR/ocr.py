import sys, getopt
import fitz
import pytesseract
from PIL import Image

def convertPdfToText(inputfile, outputfileName):
  input_file = inputfile
  pdf_file = input_file
  fullText = ""

  doc = fitz.open(pdf_file) # open pdf files using fitz bindings 
  ### ---- If you need to scale a scanned image --- ###
  zoom = 4.5 # scale your pdf file by 120%
  mat = fitz.Matrix(zoom, zoom)
  noOfPages = doc.pageCount

  for pageNo in range(noOfPages):
    page = doc.loadPage(pageNo) # number of pages
    pix = page.getPixmap(matrix = mat) # if you need to scale a scanned image
    output = outputfileName + str(pageNo) + '.png'
    pix.writePNG(output) # skip this if you don't need to render a page

    text = str(((pytesseract.image_to_string(Image.open(output), config="--psm 6 -c preserve_interword_spaces=1"))))
    fullText += text
    
#   file = open(outputfileName + '.txt', "w")
#   file.write(fullText)
#   file.close()
  print(fullText)

def main(argv):
   inputfile = ''
   outputfileName = ''
   try:
      opts, args = getopt.getopt(argv,"hi:o:",["ifile=","ofile="])
   except getopt.GetoptError:
      print('test.py -i <inputfile> -o <outputfileName>')
      sys.exit(2)
   for opt, arg in opts:
      if opt == '-h':
         print('test.py -i <inputfile> -o <outputfileName>')
         sys.exit()
      elif opt in ("-i", "--ifile"):
         inputfile = arg
      elif opt in ("-o", "--ofile"):
         outputfileName = arg
   # print('Input file is "', inputfile)
   # print('Output file is "', outputfileName)
   
   convertPdfToText(inputfile, outputfileName)

if __name__ == "__main__":
   main(sys.argv[1:])
   
#fullText = fullText.splitlines()
#ref = https://github.com/tesseract-ocr/tesseract/issues/781#issuecomment-328490156
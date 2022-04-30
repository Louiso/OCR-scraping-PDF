input_file = 'pdf_example_two.pdf'
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
    output = './image_from_pdf_two/' + str(pageNo) + '.jpg'
    pix.writePNG(output) # skip this if you don't need to render a page

    text = str(((pytesseract.image_to_string(Image.open(output), config="--psm 6 -c preserve_interword_spaces=1"))))
    fullText += text

#fullText = fullText.splitlines()
#ref = https://github.com/tesseract-ocr/tesseract/issues/781#issuecomment-328490156

print(fullText)
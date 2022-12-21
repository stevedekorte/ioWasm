# Image 
The Image object can read and draw images and provide the image 
data as a buffer. Example use:
```Io
image = Image clone open("curly.png")
image draw
image scaleTo(image width / 2, image height / 2)
image save("curly.tiff")
```

When loading an attempt will be made to convert the image into whichever 
of the following formats it is closest to: L8, LA8, RGB8, RGBA8.

Currently supported formats include PNG(which supports alpha), JPG and TIFF.

# Installation
`libpng`, `libjpeg` and `libtiff` should be installed and foundable in your system. Then:
```
eerie install https://github.com/IoLanguage/Image.git
```

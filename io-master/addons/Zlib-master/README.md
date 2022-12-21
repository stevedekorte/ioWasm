# Zlib 
The Zlib object can be used to compress and uncompress data using the 
<a href=http://en.wikipedia.org/wiki/Zlib>zlib</a> 
lossless data compression algorithm.

Example use:
```Io
compressedData := Zlib compress(uncompressedData)
uncompressedData := Zlib uncompress(compressedData)
```

# Installation
`zlib` should be installed and foundable in your system. Then:
```
eerie install https://github.com/IoLanguage/Zlib.git
```

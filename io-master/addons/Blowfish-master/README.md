# Blowfish 
The Blowfish object can be used to do encryption and decryption using 
the <a href=http://en.wikipedia.org/wiki/Blowfish_(cipher)>Blowfish</a> keyed, symmetric block cipher.

Example encryption and decription:

```Io
key := "secret"
data := "this is a message"

encryptedData := Blowfish clone setKey(key) encrypt(data)
decryptedData := Blowfish clone setKey(key) decrypt(encryptedData)

```

Or using the stream API:
```Io
key := "secret"
data := "this is a message"

cipher = Blowfish clone
cipher setIsEncrypting(true)
cipher setKey(key)
cipher beginProcessing
cipher inputBuffer appendSeq(data)
cipher process
cipher endProcess
encryptedData := cipher outputBuffer

cipher = Blowfish clone
cipher setIsEncrypting(false)
cipher setKey(key)
cipher beginProcessing
cipher inputBuffer appendSeq(encryptedData)
cipher process
cipher endProcess
decryptedData := cipher outputBuffer
```

# Installation

```
eerie install https://github.com/IoLanguage/Blowfish.git
```

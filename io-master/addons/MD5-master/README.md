# MD5 
An object for calculating MD5 hashes. Each hash calculation should instantiate its own MD5 instance.

Example:
```Io
digest := MD5 clone
digest appendSeq("this is a message")
out := digest md5String
```

# Installation
```
eerie install https://github.com/IoLanguage/MD5.git
```

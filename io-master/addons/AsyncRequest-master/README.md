# AsyncRequest 
Used for doing asynchronous file i/o. When this addon is loaded, it will override
the File proto's `readToBufferLength`, `readBufferOfLength` and write methods to 
automatically use `AsyncRequests`. 

> Note: This addon is only needed for async file requests - all socket ops are already
> asynchronous in Io.

# Installation

```
eerie install https://github.com/IoLanguage/AsyncRequest.git
```

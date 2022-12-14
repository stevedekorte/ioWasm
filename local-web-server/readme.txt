
## local web server

This is a minimal HTTPS web server for local testing. 
The command to run in the console is:

  node local-web-server/main.js

  which should be run in the root of the folder which the web server is allowed access to as
  the server will not allow access to paths that are parents of the current working directory of the web server process.
  
  The server will look for it's https cert and keys in the keys folder of the folder that main.js is in (__dirname).

You may need to run your web browser in a special mode (such as --disable-web-security for Chrome) to get it to accept a self generated cert.
Here's an example Visual Studio Code browser debugger launch script:

        {
            "type": "chrome",
            "request": "launch",
            "name": "FILE index",
            "url": "file:///${workspaceFolder}/index.html",
            "webRoot": "${workspaceFolder}",
            "runtimeArgs": [
                "--disable-web-security"
            ],
            "preLaunchTask": "create index.html",
        },

In Chrome, the first time you open the page, you'll get a warning and need click the "advanced" link and then click the "Proceed to localhost (unsafe)" link.

# generating a certificate

There should already be a self signed cerififcate in this folder,
but if not, or if it's expired, here's how to generate a new one:

In the local-web-server/keys folder, run the following in your shell:

  openssl req \
    -newkey rsa:2048 \
    -x509 \
    -new \
    -nodes \
    -keyout server.key \
    -out server.crt  \
    -subj /CN=test1   \
    -sha256  \
    -days 3650 
  
  
This key doesn't need to be kept secret as it's just to run a local web server for testing. 
You can ignore github warnings about it for your local development purposes.
  
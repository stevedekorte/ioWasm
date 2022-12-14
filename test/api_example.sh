#!/bin/sh

export PATH=$PATH:/Users/steve/_projects/sites/ioWASM/emscripten/emsdk/upstream/emscripten/

emcc api_example.c -o api_example.js -s LINKABLE=1 -s EXPORT_ALL=1 -s EXPORT_ES6=1

#-s EXPORT_ALL=1  -s EXPORT_ES6=1 -sMODULARIZE  -sEXPORTED_RUNTIME_METHODS=ccall 

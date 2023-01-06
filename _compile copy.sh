#!/bin/sh

export PATH=$PATH:/Users/steve/_projects/sites/ioWASM/emscripten/emsdk/upstream/emscripten/

emcc \
  -I io-master/libs/basekit/source \
  -I io-master/libs/basekit/source/simd_cph/include \
  io-master/libs/basekit/source/*.c \
  -I io-master/libs/coroutine/source/ \
  io-master/libs/coroutine/emsource/*.c \
  -I io-master/libs/garbagecollector/source/ \
  io-master/libs/garbagecollector/source/*.c \
  -I io-master/libs/iovm/source/ \
  io-master/libs/iovm/source/*.c \
  -I io-master/libs/iovm/source/parson \
  io-master/libs/iovm/source/parson/*.c \
  -I io-master/addons/ReadLine/source \
  io-master/addons/ReadLine/source/*.c \
  -I io-master/addons/ReadLine/source/tiny-readline \
  io-master/addons/ReadLine/source/tiny-readline/readline.c \
  -g -gsource-map --source-map-base ./ --emit-symbol-map -o iovm.js \
  -s ASYNCIFY -s LINKABLE=1 -s EXPORT_ALL=1 -s EXPORT_ES6=1 \
  -s ALLOW_MEMORY_GROWTH=1 --profiling-funcs -s EMULATE_FUNCTION_POINTER_CASTS -s MODULARIZE=1 \
  -s ENVIRONMENT=web \
  -s FORCE_FILESYSTEM
  
  #-s WIN32=0

  # -s SAFE_HEAP=1 // causes alignment errors
  # -s ASSERTIONS=1 // causes ERROR: "Exception has occurred: TypeError: Cannot set property thisProgram of #<Object> which has only a getter"
  # -s DETERMINISTIC=1 // causes ERROR: "Exception has occurred: TypeError: Cannot set property thisProgram of #<Object> which has only a getter"

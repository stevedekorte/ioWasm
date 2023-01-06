
"use strict";

(class WasmLoader extends Base {
  initPrototype () {
    this.newSlot("path", "./iovm.js")
    this.newSlot("wasmHash", null)
    this.newSlot("module", null)
    this.newSlot("delegate", null)
  }

  init () {
      super.init()
      this.setModule({})
      this.setupModule()
  }

  wasmPath () {
    const parts = this.path().split(".")
    parts.pop()
    return parts.join(".") + ".wasm"
  }

  setupModule () {
    const m = this.module() 

    m.printErr = (text) => { 
      if (arguments.length > 1) {
        text = Array.prototype.slice.call(arguments).join(' ');
      }

      const d = this.delegate()
      d.onStandardError(text)
    }

    m.print = (text) => { 
      if (arguments.length > 1) {
        text = Array.prototype.slice.call(arguments).join(' ');
      }

      const d = this.delegate()
      d.onStandardOutput(text)
    }

    m.onRuntimeInitialized = () => { 
      const d = this.delegate()
      d.onWasmLoaded.apply(d, arguments) 
    }
  }

  load () {
    this.loadUrl(this.path())
    this.loadWasm()
  }

  loadUrl (url) {
    import(url).then((m) => {
      m.default(this.module())
    }).catch((error) => {
      this.debugLog("error:" + error);
    })
  }

  loadWasm () {
    fetch(this.wasmPath()).then((response) => { 
      if (!response.ok) {
        this.debugLog("fetch error: " + response.status)
        throw new Error(response.status);
      }
      return response.arrayBuffer();
    }).then((buffer) => {
      //this.debugLog("loaded " + this.wasmPath() + " into ArrayBuffer of " + buffer.byteLength + " bytes")
      this.onFetchWasmBuffer(buffer)
    })
  }

  onFetchWasmBuffer (arrayBuffer) {
    //this.debugLog(this.type() + " onFetchBuffer ")
    //const s =  String.fromCharCode.apply(null, new Uint16Array(arrayBuffer));
    const s = btoa(arrayBuffer);
    const hash = this.hashOfString(s)
    //this.debugLog("hash of wasm buffer: " + hash)
    this.setWasmHash(hash)
  }

  hashOfString (s) {
    let h = 0xdeadbeef;
    for(let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    }
    return (h ^ h >>> 16) >>> 0;
  }

  debugLog (s) {
    console.log(s)
    alert(s)
  }

}.initThisClass());

/*
window.IoWASM = {
  preRun: [],

  postRun: [],

  'printErr': function (text) { 
    console.log('stderr: ' + text) 
  },
  
  print: function (text) {
      if (arguments.length > 1) {
        text = Array.prototype.slice.call(arguments).join(' ');
      }
      // These replacements are necessary if you render to raw HTML
      text = text.replace(/&/g, "&amp;");
      text = text.replace(/</g, "&lt;");
      text = text.replace(/>/g, "&gt;");
      text = text.replace('\n', '<br>', 'g');
      console.log(text);
      Repl.shared().addOutput(text)
  },

  canvas: (function() {
    var canvas = document.getElementById('canvas');
    // As a default initial behavior, pop up an alert when webgl context is lost. To make your
    // application robust, you may want to override this behavior before shipping!
    // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
    canvas.addEventListener("webglcontextlost", function(e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);
    return canvas;
  })(),

  setStatus: function (text) {
    console.log("setStatus:", text);
  },

  totalDependencies: 0,

  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    MyModule.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  },

  onRuntimeInitialized: function () {
    window.main(this)
  }
};

import initModule from "./iovm.js";
initModule(IoWASM);
*/
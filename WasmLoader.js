
(class WasmLoader extends Base {
  initPrototype () {
    this.newSlot("path", "./iovm.js")
    this.newSlot("module", null)
    this.newSlot("delegate", null)
  }

  init () {
      super.init()
      this.setModule({})
      this.setupModule()
  }

  setupModule () {
    const m = this.module() 

    m.printErr = () => { 
      const d = this.delegate()
      d.onStandardError.apply(d, arguments) 
    }

    m.print = () => { 
      const d = this.delegate()
      d.onStandardOutput.apply(d, arguments) 
    }

    m.onRuntimeInitialized = () => { 
      const d = this.delegate()
      d.onLoadedWasm.apply(d, arguments) 
    }
  }

  load () {
    import(this.path()).then((m) => {
      m.default(this.module())
    })
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
      IoRepl.shared().addOutput(text)
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
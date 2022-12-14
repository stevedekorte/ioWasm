

// ---------------------------------------------------------------------

/*
if (!window.chrome) {
  const e = document.getElementById('status');
  e.innerHTML = "Sorry, this currently only works with the Chrome browser."
  e.style.color = "orange"
}
*/


(class IoRepl extends Base {

  static launch () {
    const w = WasmLoader.shared()
    w.setPath("./iovm.js")
    w.setDelegate(IoRepl.shared())
    w.load()
  }

  initPrototype () {
    this.newSlot("wasmLoader", null)
    this.newSlot("ioState", null)
    this.newSlot("isEvaling", false)
    this.newSlot("history", null)
    this.newSlot("historyIndex", 0)
  }

  init () {
      super.init()
      this.setHistory([])
      this.inputElement().addEventListener("keydown", (event) => { this.onKeyDown(event); })
      //this.inputElement().addEventListener("keyup", (event) => { this.onKeyUp(event); })
  }

  // --- WasmLoader protocol ---

  onWasmLoaded () {
    this.run()
  }

  onStandardError () {
    const s = Array.prototype.slice.call(arguments).join(' ');
    this.addOutput("STDERR: " + s)
    this.lastErrorElement().innerHTML += s
  }

  onStandardOutput (s) {
    this.addOutput(s)
  }

  // --- keyboard controls ---

  onKeyDown (event) {
    const k = event.keyCode 
    //console.log("down  ", k)
    const returnKeyCode = 13;
    const upArrowKeyCode = 38;
    const downArrowKeyCode = 40;
    const kKeyCode = 75;
    const uKeyCode = 85;
    const isClearKey = k == kKeyCode || k == uKeyCode
    const isSuper = event.metaKey || event.ctrlKey

    if (k == returnKeyCode && isSuper) {
      this.onInput()
      this.clearInput()
      event.preventDefault()
    }

    if (k == upArrowKeyCode && isSuper) {
      this.onCommandUpArrowKey(event)
    }

    if (k == downArrowKeyCode && isSuper) {
      this.onCommandDownArrowKey(event)
    }

    if (isClearKey && event.shiftKey && isSuper) {
      this.clearInput()
    }

    if (isClearKey && !event.shiftKey && isSuper) {
      this.clearOutput()
    }

    this.textAreaAdjust()
  }

  outputElement () {
    return document.getElementById('output');
  }

  inputElement () {
    return document.getElementById('input');
  }

  statusElement () {
    return document.getElementById('status');
  }

  replElement () {
    return document.getElementById('repl');
  }

  resetIoState () {
    this.setIoState(this.newIoState())
  }

  wasm () {
    return WasmLoader.shared().module()
  }

  newIoState () {
    this.cleanup()
    const ioState = this.wasm()._IoState_new()
    this.wasm()._IoState_init(ioState);
    return ioState
  }

  cleanup () {
    const ioState = this.ioState()
    if (ioState) {
      this.wasm()._IoState_free(ioState)
      this.setIoState(null)
    }
  }

  run () {
    this.setIoState(this.newIoState())
    this.statusElement().innerHTML = ""
    //this.statusElement().display = "none"
    this.replElement().style.opacity = 1
    this.replElement().style.animation = "fadein 2s"
    this.inputElement().value = '"Hello world!"'
    this.inputElement().focus()
  }

  onInput () {
    const s = this.inputElement().value
    //console.log("onInput:'" + s + "'")
    this.eval(s)
    //this.clearInput()
  }

  clearInput () {
    this.inputElement().value = ""
    //this.inputElement().focus()
  }

  clearOutput () {
    this.outputElement().innerHTML = ""
  }

  eval (jsString) {
    try {
      this.addResultElement(jsString)
      //const runString = jsString
      const runString = "(" + jsString + ") println"
      console.log("eval: ", runString)
      this.setIsEvaling(true)
      const ioState = this.ioState()
      const wasm = this.wasm()
      const ioLobby = wasm._IoState_lobby(ioState);    
      const cString = wasm.allocateUTF8(runString); 
      const cLabel = wasm.allocateUTF8("command line code"); 
      const result = wasm._IoState_on_doCString_withLabel_(ioState, ioLobby, cString, cLabel);
      wasm._free(cString);
      wasm._free(cLabel);
      this.setIsEvaling(false)
      //console.log("result:", result)
      window.scrollTo(0, document.body.scrollHeight);
      this.inputElement().focus()
    } catch (e) {
      //this.addOutput("WASM EXCEPTION:" + e)
      this.lastErrorElement().innerHTML += "" + e
      //this.resetIoState()
    }
  }

  addInput (text) {
    this.outputElement().innerHTML += text + "<br>"
  }

  addOutput (text) {
    this.lastResultElement().innerHTML += text + '<br>';
  }

  addResultElement (text) {    
    const e = document.createElement('div')
    let s = '<div class="replPair" style="animation:fadein 0.5s;">' 
    s += text 
    s += '<br>'
    s += '<div class="resultcontainer">'
    s += '<div class="resultarrow">→</div>'
    s += '<div class="result"></div>'
    s += '<div class="error"></div>'
    s += '</div>'
    s += '</div>'
    s += '<br>'
    e.innerHTML = s;
    this.outputElement().appendChild(e)
  }

  lastResultElement () {
    const resultElements = document.getElementsByClassName("result");
    if (resultElements.length) {
      return resultElements[resultElements.length-1]
    }
    return undefined
  }

  lastErrorElement () {
    const resultElements = document.getElementsByClassName("error");
    if (resultElements.length) {
      return resultElements[resultElements.length-1]
    }
    return undefined
  }

  onSampleMenu (selectedOption) {
    const e = this.inputElement()
    e.opacity = 0
    e.value = ""
    e.style.animation = ""
    setTimeout(() => {
      e.value = selectedOption.value
      e.opacity = 1
      e.style.animation = "fadein 1s"
    }, 1)
  }

  textAreaAdjust () {
    const e = this.inputElement()
    e.style.height = "1px";
    e.style.height = (20 + e.scrollHeight)+"px";
  }

}.initThisClass());

IoRepl.launch()
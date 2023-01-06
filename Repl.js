
"use strict";

// ---------------------------------------------------------------------

/*
if (!window.chrome) {
  const e = document.getElementById('status');
  e.innerHTML = "Sorry, this currently only works with the Chrome browser."
  e.style.color = "orange"
}
*/


getGlobalThis().onIoToJsMessage = function (jsonString) {
  console.log("JS: onIoToJsMessage: ", JSON.parse(jsonString))
};

(class Repl extends Base {

  isOnMobileBrowser () {
    return (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i) 
      || navigator.userAgent.match(/iPad/i) 
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i));
  }

  static launch () {
    Repl.shared().checkForMobile()

    const w = WasmLoader.shared()
    w.setPath("./iovm.js")
    w.setDelegate(Repl.shared())
    w.load()
  }

  checkForMobile () {
    if (this.isOnMobileBrowser()) {
      this.statusElement().innerHTML += " (may not work on mobile browsers)"
    }
  }

  initPrototype () {
    this.newSlot("wasmLoader", null)
    this.newSlot("ioState", null)
    this.newSlot("isEvaling", false)
    this.newSlot("history", null)
  }

  init () {
      super.init()
      this.setHistory(ReplHistory.clone())
      this.inputElement().addEventListener("keydown", (event) => { this.onKeyDown(event); })
      this.inputElement().addEventListener("keyup",   (event) => { this.onKeyUp(event); })
      this.inputElement().addEventListener("input",   (event) => { this.onInputChange(event); })
  }

  // --- WasmLoader protocol ---

  onWasmLoaded () {
    this.run()
  }

  onStandardError () {
    const s = Array.prototype.slice.call(arguments).join(' ');
    if (this.lastErrorElement()) {
      this.addOutput("STDERR: " + s)
      this.lastErrorElement().innerHTML += s
    } else {
      console.log("STDERR: " + s)
    }
  }

  onStandardOutput (s) {
    this.addOutput(s)
  }

  // --- keyboard controls ---

  onKeyDown (event) {
    const k = event.keyCode 
    console.log("keydown  code:", k)
    const returnKeyCode = 13;
    const upArrowKeyCode = 38;
    const downArrowKeyCode = 40;
    const kKeyCode = 75;
    const uKeyCode = 85;
    const hKeyCode = 72;
    const s_KeyCode = 83;
    const l_KeyCode = 76;
    const isClearKey = k == kKeyCode || k == uKeyCode
    const isSuper = event.metaKey || event.ctrlKey

    if (k == returnKeyCode && isSuper) {
      this.onInput()
      this.clearInput()
      event.preventDefault()
    }

    if (k == upArrowKeyCode && isSuper) {
      this.inputElement().value = this.history().previous()
      event.preventDefault()
    }

    if (k == downArrowKeyCode && isSuper) {
      this.inputElement().value = this.history().next()
      event.preventDefault()
    }

    if (isClearKey && event.shiftKey && isSuper) {
      this.clearInput()
      event.preventDefault()
    }

    if (isClearKey && !event.shiftKey && isSuper) {
      this.clearOutput()
      event.preventDefault()
    }

    if (k == hKeyCode && isSuper) {
      const e = this.helpSectionElement()
      e.style.display = e.style.display == "none" ? "block" : "none";
      event.preventDefault()
    }

    if (k == s_KeyCode && isSuper) {
      WasmState.shared().store()
    }

    if (k == l_KeyCode && isSuper) {
      WasmState.shared().load()
    }

    this.textAreaAdjust()
  }

  onKeyUp (event) {
    //this.history().updateCurrentEntry(this.inputElement().innerHTML)
  }

  // elements

  outputElement () {
    return document.getElementById('output');
  }

  inputElement () {
    return document.getElementById('input');
  }

  inputSectionElement () {
    return document.getElementById('inputsection');
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

  lastElementWithClass (className) {
    const resultElements = document.getElementsByClassName(className);
    if (resultElements.length) {
      return resultElements[resultElements.length-1]
    }
    return undefined
  }

  helpSectionElement () {
    return this.lastElementWithClass("helpsection")
  }

  lastResultElement () {
    return this.lastElementWithClass("result")
  }

  lastErrorElement () {
    return this.lastElementWithClass("error")
  }

  lastReplPairElement () {
    return this.lastElementWithClass("replPair")
  }

  // wasm

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
    this.statusElement().innerHTML = "Loaded WASM..."

    this.setIoState(this.newIoState())
    this.statusElement().innerHTML = ""
    //this.statusElement().display = "none"
    this.replElement().style.opacity = 1
    this.replElement().style.animation = "fadein 2s"
    this.inputElement().value = '"Hello world!"'
    this.inputElement().focus()
  }

  onInputChange () {
    const s = this.inputElement().value
    this.history().updateCurrentEntry(s)
  }

  onInput () {
    const s = this.inputElement().value
    //console.log("onInput:'" + s + "'")
    this.history().updateCurrentEntry(s)
    this.history().addEntry("")
    this.clearInput()
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
    this.addResultElement(jsString)
    this.inputSectionElement().style.opacity = 0.4
    this.lastReplPairElement().style.opacity = 0.4
    //console.log("this.lastReplPairElement().style.opacity = ", this.lastReplPairElement().style.opacity)
    // use a timeout so our UI changes can apply before eval begins
    setTimeout(() => { 
      this.justEval(jsString) 
    }, 1)
  }

  justEval (jsString) {
    try {
      //const runString = "(" + jsString + ") println"
      const runString = jsString
      console.log("eval: ", runString)
      this.setIsEvaling(true)
      const ioState = this.ioState()
      const wasm = this.wasm()
      const ioLobby = wasm._IoState_lobby(ioState);    
      const cString = wasm.allocateUTF8(runString); 
      const cLabel = wasm.allocateUTF8("repl"); 
      wasm._IoState_on_doCString_withLabel_andPrintResult(ioState, ioLobby, cString, cLabel);

      //wasm._IoObject_print(result);

      wasm._free(cString);
      wasm._free(cLabel);
      this.setIsEvaling(false)
    } catch (e) {
      //this.addOutput("WASM EXCEPTION:" + e)
      this.lastErrorElement().innerHTML += "" + e
      //this.resetIoState()
    }
    this.postEval()
  }

  postEval () {
      window.scrollTo(0, document.body.scrollHeight);
      this.inputElement().focus()
      this.inputSectionElement().style.opacity = 1
      this.lastReplPairElement().style.opacity = 1
  }

  addInput (text) {
    this.outputElement().innerHTML += text + "<br>"
  }

  addOutput (text) {
    if (this.lastResultElement()) {
      this.lastResultElement().innerHTML += text + '<br>';
    } else {
      console.log(text)
    }
  }

  addResultElement (text) {    
    const e = document.createElement('div')
    //let s = '<div class="replPair" style="animation:fadein 0.5s;">' 
    let s = '<div class="replPair" style="opacity: 0.1;">' 
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

Repl.launch()
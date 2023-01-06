
"use strict";

// WasmState
// experimental code to store and load WASM state

if (!getGlobalThis().assert) {
  getGlobalThis().assert = function (v) {
    if (!v) {
      throw new Exception("failed assertation")
    }
  };
};

(class WasmState extends Base {
  initPrototype () {
    this.newSlot("wasmModule", null)
    this.newSlot("memory", null)
    this.newSlot("db", null)
    this.newSlot("stateKey", "1")
    this.newSlot("delegate", null)
  }

  init () {
    super.init()
    this.setWasmModule(WasmLoader.shared().module())
    this.setDb(PersistentAsyncMap.clone().setName("WasmStore"))
    this.openStore()
  }

  openStore () {
    this.db().asyncOpen(() => { 
      this.onOpenStoreSuccess() 
    }, (error) => { 
      this.onOpenStoreError(error) 
    })
  }

  onOpenStoreSuccess () {
    console.log(this.type() + ".onOpenStoreSuccess()")
  }

  onOpenStoreError (error) {
    console.log(this.type() + ".onOpenStoreError(" + error + ")")
  }

  isOpen () {
    const db = this.db()
    return db && db.isOpen()
  }

  // store

  store () {
    assert(this.isOpen())
    const wasmModule = this.wasmModule()
    const memory = new Uint8Array(wasmModule.HEAP8); 
    this.setMemory(memory)
    this.storeMemory()
    return this
  }

  storeMemory () {
    this.db().asyncAtPut(this.stateKey(), this.memory(), () => { this.onStoreMemory() }, (error) => { this.onStoreMemoryError(error) })
  }

  onStoreMemory () {
    console.log(this.type() + ".onStoreMemory()")
  }

  onStoreMemoryError (error) {
    console.log(this.type() + ".onStoreMemoryError(" + error + ")")
  }

  // load

  load () {
    assert(this.isOpen())
    this.db().asyncAt(this.stateKey(), (data) => { this.onLoadMemory(data) }, (error) => { this.onLoadMemoryError(error) })
  }

  onLoadMemory (data) {
    //console.log(this.type() + ".onLoadMemory ", data)
    const wasmModule = this.wasmModule()
    //assert(data.length === wasmModule.HEAP8.length)
    //wasmModule.HEAP8.length = data.length
    wasmModule.HEAP8.set(data)
  }

  onLoadMemoryError(error) {
    console.log(this.type() + " onLoadMemoryError(" + error + ")")
  }

}.initThisClass());

WasmState.shared() // start opening db


  /*
  compile () {
    assert(this.wasmModule() === null)
    assert(this.memory() !== null)
    // wasmModule should be null, and memory should be sett

    // First, create a WebAssembly module using the WebAssembly.compile function 
    WebAssembly.compile(wasmCode).then((wasmModule) => { 
      this.afterCompile(wasmModule) 
    }); 
  }
  */

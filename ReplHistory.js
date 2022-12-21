
"use strict";

(class ReplHistory extends Base {

  initPrototype () {
    this.newSlot("entries", null)
    this.newSlot("maxEntries", 10000)
    this.newSlot("index", 0)
  }

  init () {
      super.init()
      this.setEntries([])
  }

  // --- WasmLoader protocol ---

  addEntry (s) {
    this.entries().unshift(s)
    if (this.entries().length > this.maxEntries()) {
      this.entries().pop()
    }
    this.resetIndex()
    return this
  }

  updateCurrentEntry (s) {
    this.entries().shift()
    this.entries().unshift(s)
    return this
  }

  resetIndex () {
    this.setIndex(0)
    return this
  }

  currentEntry () {
    const i = this.index()
    return this.entries()[i]
  }

  previous () {
    const i = Math.min(this.index() + 1, this.entries().length - 1) 
    this.setIndex(i)
    return this.currentEntry()
  }

  next () {
    const i = Math.max(this.index() - 1, 0) 
    this.setIndex(i)
    return this.currentEntry()
  }

}.initThisClass());


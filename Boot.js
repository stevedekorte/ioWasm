"use strict";

class Boot extends Object {

  files () {
    return [
      "shared/Base/getGlobalThis.js",
      "shared/Base/Base.js",
      "shared/Base/Type.js",
      "shared/storage/IndexedDBTx.js",
      "shared/storage/IndexedDBFolder.js",
      "shared/storage/PersistentAsyncMap.js",
      "WasmLoader.js",
      "WasmState.js",
      "ReplHistory.js",
      "Repl.js"
    ]
  }

  start () {
    this._queue = this.files().slice()
    this.loadNext()
  }

  loadNext () {
    if (this._queue.length) {
      const file = this._queue.shift()
      this.loadScript(file, () => this.loadNext())
    } else {
      this.didFinish()
    }
  }

  loadScript (url, callback) {
    //console.log("load url '" + url + "'")
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    //script.type = 'text/javascript';
    script.type = "module";
    script.src = url;
    script.onreadystatechange = (event) => {
      callback();
    }
    script.onload = callback;
    script.onerror = (error) => {
      console.log(error)
    }
    head.appendChild(script);
  }

  didFinish () {
    //Repl.launch();
  }
};

new Boot().start()

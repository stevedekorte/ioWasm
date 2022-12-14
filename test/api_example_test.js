"user strict"

/*
var Module = {
  noExitRuntime: true,
  exports: {}
};
*/

import('./api_example.js').then(
  moduleExports => {
    moduleExports.default().then((m) => {
      console.log("m:", m)
      m._sayHi()
    })
  },
  error => {
    console.error('there was an error loading the script')
    throw error
  },
)

/*
import("./api_example.js").then((module) => {
  console.log("running ", module)
}).catch((error) => {
  console.log("error ", error)
});
*/

console.log("import done")

/*
var factory = import('api_example.js');

factory().then((instance) => {
  instance._sayHi(); // direct calling works
  instance.ccall("sayHi"); // using ccall etc. also work
  console.log(instance._daysInWeek()); // values can be returned, etc.
});
*/

/*
class Boot extends Object {

  files () {
    return [
      "api_example.js",
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
    console.log("load url '" + url + "'")
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
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
    console.log("Boot done")
    //SimApp.launch();
  }
};

new Boot().start()
*/
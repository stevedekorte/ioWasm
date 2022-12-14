
"use strict";

// A single function to access globals that works
// in the browser (which uses 'window') and on node.js (which uses 'global')


function getGlobalThis() {

	const isDefined = function (v) {
		return typeof(v) !== "undefined"
	}

	if (isDefined(globalThis)) {
        return globalThis;
    }

	if (isDefined(self)) {
        return self;
    }

	if (isDefined(window)) {
		window.global = window;
		return window;
	}

	if (isDefined(global)) {
		global.window = global;
		return global;
	}

	// Note: this might still return the wrong result!
	if (isDefined(this)) {
        return this;
    }
    
	throw new Error("Unable to locate global `this`");
  };

  getGlobalThis().getGlobalThis = getGlobalThis;
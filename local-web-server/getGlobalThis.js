


// A single function to access globals that works
// in the browser (which uses 'window') and on node.js (which uses 'global')

function getGlobalThis () {
	if (typeof(globalThis) !== 'undefined') {
        return globalThis;
    }

	if (typeof(self) !== 'undefined') {
        return self;
    }

	if (typeof(window) !== 'undefined') {
		window.global = window;
		return window;
	}

	if (typeof(global) !== 'undefined') {
		global.window = global;
		return global;
	}

	// Note: this might still return the wrong result!
	if (typeof(this) !== 'undefined') {
        return this;
    }
    
	throw new Error('Unable to locate global `this`');
  };

  getGlobalThis().getGlobalThis = getGlobalThis;
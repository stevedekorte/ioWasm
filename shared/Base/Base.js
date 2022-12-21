
"use strict";

// ------------------------------------------------------------------

Object.defineSlot = function (obj, slotName, slotValue) {
    //if (!Object.hasOwnSlot(obj, slotName, slotValue)) {
    const descriptor = {
        configurable: true,
        enumerable: false,
        value: slotValue,
        writable: true,
    }
    Object.defineProperty(obj, slotName, descriptor)
    //}
}

if (!String.prototype.capitalized) {
    Object.defineSlot(String.prototype, "capitalized",
        function () {
            return this.replace(/\b[a-z]/g, function (match) {
                return match.toUpperCase();
            });
        }
    );
}

// ------------------------------------------------------------------

(class Base {
    // Base class with helpful methods for cloning and slot creation 

    static isInBrowser () {
        return (typeof(document) !== 'undefined')
    }

    isInBrowser () {
        return (typeof(document) !== 'undefined')
    }

    static shared () {
        if (!this._shared) {
            this._shared = this.clone()
        }
        return this._shared
    }

    static type () {
        return this.name
    }

    static initThisClass () {
        //console.log("this.classType() = ", this.classType())
        /*
        if (typeof(getGlobalThis()[this.type()]) !== "undefined") {
            const msg = "WARNING: Attempt to redefine getGlobalThis()['" + this.type() + "']"
            console.warn(msg)
            throw new Error(msg)
        }*/

        getGlobalThis()[this.type()] = this

        if (this.prototype.hasOwnProperty("initPrototypeSlots")) {
            // each class inits it's own prototype, so make sure we only call our own initPrototypeSlots()
            this.prototype.initPrototypeSlots()
        }
        
        if (this.prototype.hasOwnProperty("initPrototype")) {
            // each class inits it's own prototype, so make sure we only call our own initPrototype()
            //this.prototype.initPrototype.apply(this.prototype)
            this.prototype.initPrototype()
        }
        return this
    }

    static type () {
        return this.name
    }

    type () {
        return this.constructor.name
    }

    static clone () {
        const obj = new this()
        obj.init()
        return obj
    }

    initPrototype () {
        this.newSlot("uuid", null)
        this.newSlot("isDebugging", false)
    }

    debugLog (s) {
        if (this.isDebugging()) {
            if (typeof(s) === "function") {
                s = s()
            }
            console.log(" " + s)
        }
    }

    init () {
        // subclasses should override to initialize
    }

    newSlot (slotName, initialValue) {
        if (typeof (slotName) !== "string") {
            throw new Error("slot name must be a string");
        }

        if (initialValue === undefined) {
            initialValue = null
        };

        const privateName = "_" + slotName;
        this[privateName] = initialValue;

        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }

        const setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                this[privateName] = newValue;
                return this;
            }
        }

        return this;
    }


    uuid () {
        if (!this._uuid) {
            this.setUuid(this.newUuid())
        }
        return this._uuid
    }

    newUuid () { 
        // NEW - not in standard Base
        // TODO: better entropy
        const n1 = Math.floor(Math.pow(2, 64) * Math.random() / 1000).toString()
        //const n1 = Math.floor(Math.pow(2, 64) * Math.random()).toString(36)
        //const n2 = Math.floor(Math.pow(2, 64) * Math.random()).toString(36)
        //return this.type() + "_" + n1 + "" + n2
        return this.type() + "_" + n1 
    }

    typeId () {
        return this.uuid()
        //return this.type() + "_" + this.uuid()
    }

}.initThisClass());

// ----------------------------------

Object.defineSlot(Array.prototype, "detect",
    function (func) {
        for (let i = 0; i < this.length; i++) {
            const v = this[i]
            if (func(v)) {
                return v
            }
        }
        return undefined
    }
);


Object.defineSlot(Array.prototype, "shallowCopy",
    function () {
        return this.slice();
    }
);

Object.defineSlot(Array.prototype, "first",
    function (item) {
        return this[0];
    }
);

Object.defineSlot(Array.prototype, "remove",
    function (item) {
        return this.splice(this.indexOf(item), 1);
    }
);

Object.defineSlot(Array.prototype, "clear",
    function () {
        while (this.length) {
            this.pop()
        }
        return this
    }
);

Object.defineSlot(Array.prototype, "shallowEquals",
    function (other) {
        if (this.length === other.length) {
            for (let i = 0; i < this.length; i++) {
                if (this[i] !== other[i]) {
                    return false
                }
            }
            return true
        }
        return false
    }
);

window.ProtoClass = Base;

/*
    // --- destroy ---
    this.newSlot("destroyListeners", null); 

    this.setDestroyListeners(new Set())

    addDestroyListener (obj) {
        this.destroyListeners().add(obj)
        return this
    }

    removeDestroyListener (obj) {
        this.destroyListeners().delete(obj)
        return this
    }

    willDestroySelf () {
        this.destroyListeners().forEach(o => o.onWillDestroyObject(this))
    }

    // ---
*/
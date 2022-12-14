
"use strict";

(class Type extends Base {
    static isArray (v) {
        return Array.isArray(v)
    }

    static isString (v) {
        return typeof(v) === "string"
    }

    static assertIsString (v) {
        if (!this.isString(v)) {
            throw new Error("assert failure: value not a string, it's a " + typeof(v))
        }
    }

    static assertIsArray (v) {
        if (!this.isArray(v)) {
            throw new Error("assert failure: value not a array, it's a " + typeof(v))
        }
    }

    static assertIsArrayOfStrings (v) {
        this.assertIsArray(v)
        v.forEach(s => this.assertIsString(s))
    }

    static assertIsInstanceOf (v, aClass) {
        if (v.constructor && v.constructor === aClass) {
            return
        } 
        throw new Error("assert failure: value not instance of class " + aClass.name)
    }

    static describe (v) {
        const type = typeof(v)

        if (v === null) {
            return "null"
        }

        if (v === undefined) {
            return "undefined"
        }

        if (v.description) {
            return v.description()
        }

        if (type === "object") {
            return v.type()
        }

        return "<no description available>"
    }

}.initThisClass());

"use strict";

/*

    Type-ideal

    Value/reference type related functions.

    Example use:

        if (Type.isNullOrUndefined(value)) { ...}


    Known types:

        Literals:

            null
            undefined
            string
            symbol
            number

        Other types:

            object
            array

            Int8Array
            Uint8Array
            Uint8ClampedArray
            Int16Array
            Uint16Array
            Int32Array
            Uint32Array
            Float32Array
            Float64Array
            BigInt64Array
            BigUint64Array


    More example uses:

        const i8a = new Int8Array(6);   
        console.log("is a Int8Array: ", Type.isInt8Array(i8a))

*/


getGlobalThis().Type = (class Type extends Object {

    static allTypeNames () {
        return [
            "Array",
            "Boolean",
            "Map",
            "Null",
            "Number",
            "Set",
            "String",
            "Symbol",
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
            "BigInt64Array",
            "BigUint64Array",
            //"TypedArray",
            "Undefined",
            "Object", // put object last so other types have preference
        ]
    }

    static typedArrayTypeNames () {
        return [
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
            "BigInt64Array",
            "BigUint64Array",
        ]
    }

    static isClass (v) {
        const result = typeof(v) === "function"
            && /^class\s/.test(Function.prototype.toString.call(v));

        return result
    }

    static isLiteral (v) {
        return  Type.isString(v) ||
                Type.isNumber(v) ||
                Type.isBoolean(v) ||
                Type.isNull(v) ||
                Type.isUndefined(v);
    }

    static isArray (value) {
        return !Type.isNull(value) && 
                Type.isObject(value) && 
                value.__proto__ === ([]).__proto__ &&
                !Type.isUndefined(value.length)
    }

    static isSet (value) {
        return !Type.isNull(value) && 
            Type.isObject(value) && 
            value.__proto__ === Set.prototype 
    }

    static isMap (value) {
        return !Type.isNull(value) && 
            Type.isObject(value) && 
            value.__proto__ === Map.prototype 
    }  

    static isIterator (value) {
        return !Type.isNull(value) && 
                Type.isObject(value) && 
                typeof(value[Symbol.iterator]) === "function";
    }

    static isBoolean (value) {
        return typeof(value) === "boolean"
    }   

    static isFunction (value) {
        return typeof(value) === "function"
    }  

    static isUndefined (value) {
        return value === undefined // safe in modern browsers, even safe in older browsers if undefined is not redefined
    }

    static isNull (value) {
        return value === null
    }

    static isNullOrUndefined (value) {
        return this.isUndefined(value) || this.isNull(value)
    }

    static isNaN (value) {
        return isNaN(value)
    }

    static isNumber (value) {
        return typeof(value) === "number"
    }

    static isObject (value) { 
        // WARNING: true for array and dictionary too!
        return typeof(value) === "object" 
    }

    static isString (value) {
        return typeof(value) === "string"
    } 

    static isSymbol (value) {
        return typeof(value) === "symbol"
    } 

    // typed arrays 

    static valueHasConstructor (v, constructor) {  // private
        return !Type.isNullOrUndefined(v) && (Object.getPrototypeOf(v) === constructor.prototype);
    }

    static isInt8Array (v) {
        return Type.valueHasConstructor(v, Int8Array);
    }

    static isUint8Array (v) {
        return Type.valueHasConstructor(v, Uint8Array);
    }

    static isUint8ClampedArray (v) {
        return Type.valueHasConstructor(v, Uint8ClampedArray);
    }

    static isInt16Array (v) {
        return Type.valueHasConstructor(v, Int16Array);
    }

    static isUint16Array (v) {
        return Type.valueHasConstructor(v, Uint16Array);
    }

    static isInt32Array (v) {
        return Type.valueHasConstructor(v, Int32Array);
    }

    static isUint32Array (v) {
        return Type.valueHasConstructor(v, Uint32Array);
    }
    
    static isFloat32Array (v) {
        return Type.valueHasConstructor(v, Float32Array);
    }

    static isFloat64Array (v) {
        return Type.valueHasConstructor(v, Float64Array);
    }

    static isBigInt64Array (v) {
        return Type.valueHasConstructor(v, BigInt64Array);
    }

    static isBigUint64Array (v) {
        return Type.valueHasConstructor(v, BigUint64Array);
    }

    
    static isTypedArray (v) {
        return Type.valueHasConstructor(v, TypedArray);
    }
    

    // type name

    static typeName (value) {
        if (value === null) {
            return "Null"
        }

        if (Type.isObject(value)) {
            //return value.type()
            return value.constructor.name
        }

        const typeNames = this.allTypeNames()
        for (let i = 0; i < typeNames.length; i++) {
            const typeName = typeNames[i]
            const methodName = "is" + typeName
            if (this[methodName].call(this, value)) {
                return typeName
            }
        }
        throw new Error("unable to identify type for value: ", value)
    }

    static typeNamesForValue (value) {
        const matches = []
        const typeNames = this.allTypeNames()
        for (let i = 0; i < typeNames.length; i++) {
            const typeName = typeNames[i]
            const methodName = "is" + typeName
            if (this[methodName].apply(this, [value])) {
                matches.push(typeName)
            }
        }
        return matches
    }

    static assertValueTypeNames (v, validTypeNames) {
        let doesMatch = true
        const foundTypeNames = this.typeNamesForValue(v)
        if (foundTypeNames.length === validTypeNames.length) {
            for (let i = 0; i < foundTypeNames.length; i ++) {
                const name = foundTypeNames[i]
                if (!validTypeNames.includes(name)) {
                    doesMatch = false;
                    break;
                }
            }
        } else {
            doesMatch = false
        }
        if (!doesMatch) {
            throw new Error(JSON.stringify(validTypeNames) + " != " + JSON.stringify(foundTypeNames) )
        }
    }

    static test () { // private
        this.assertValueTypeNames(null, ["Null", "Object"])
        this.assertValueTypeNames(undefined, ["Undefined"])
        this.assertValueTypeNames("foo", ["String"])
        this.assertValueTypeNames(1, ["Number"])
        this.assertValueTypeNames([], ["Array", "Object"])
        this.assertValueTypeNames({} ["Object"])
        this.assertValueTypeNames(new Int8Array(), ["Int8Array", "Object"])

        // extras
        //assert(Type.isNullOrUndefined(undefined))
        //assert(Type.isNullOrUndefined(null))
    }

});


//Type.test()
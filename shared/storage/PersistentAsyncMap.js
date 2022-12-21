"use strict";

/*

    PersistentAsyncMap

    An async Map wrapper for IndexedDB.

    Public methods:

        asyncOpen(resolve, errorCallback) 
        close()
        asyncClear(resolve)
        asyncHasKey(key, resolve)  // resolve passes true or false
        asyncAt(key, resolve) // resolve passes value or undefined
        asyncAtPut(key, value, resolve, reject) 
        asyncRemoveKey(key, resolve, reject)
        
*/

(class PersistentAsyncMap extends ProtoClass {
    initPrototypeSlots () {
        this.newSlot("name", "PersistentAsyncDictionary")
        this.newSlot("idb", null)
    }

    init () {
        super.init()
        this.setIdb(IndexedDBFolder.clone())
        //this.setIsDebugging(true)
    }
    
    // open

    assertAccessible () {
        super.assertAccessible()
        this.assertOpen()
    }

    isOpen () {
        return this.idb().isOpen()
    }

    open () {
        throw new Error(this.type() + " synchronous open not supported")
        return this
    }

    close () {
        if (this.isOpen()) {
            this.idb().close()
            this.setIsOpen(false)
        }
        return this
    }

    asyncOpen (resolve, reject) {
        this.idb().setPath(this.name())
        this.idb().asyncOpenIfNeeded( () => {
            this.onOpen(resolve) 
        }, reject )
        return this
    }
	
    onOpen (resolve, reject) {
        // load the cache
        this.debugLog(" onOpen() - loading cache")
        
        if (false) {
            this.asyncClear(callback)
        } else {
            if (resolve) {
                resolve()
            }
        }
    }
	
    assertOpen () {
        assert(this.isOpen())
        return this
    }
	
    // ---- operations ---
		
    asyncClear (resolve) {
        this.idb().asyncClear(resolve) 
    }

    asyncAllKeys (resolve) {
        this.idb().asyncAllKeys(resolve) 
    }

    asyncHasKey (key, resolve) { // resolve passes true or false
        this.idb().asyncHasKey(key, resolve) 
    }

    /*
    async asyncHasKey (key) {
        return new Promise((resolve, reject) => {
            this.idb().hasKey(key, resolve) 
        })
    }
    */

    asyncAt (key, resolve, reject) { // resolve passes value or undefined
        assert(!Type.isNullOrUndefined(resolve))
        this.idb().asyncAt(key, resolve, reject)
    }

    asyncAtPut (key, value, resolve, reject) {
        this.asyncHasKey(key, (hasKey) => {
            if (hasKey) {
                this.asyncUpdate(key, value, resolve, reject)
            } else {
                this.asyncAdd(key, value, resolve, reject)
            }
        })
    }

    asyncUpdate (key, value, resolve, reject) { // private
	    const tx = this.idb().newTx()
	    tx.begin()
        tx.setIsDebugging(this.isDebugging())
        tx.setSucccessCallback(resolve)
        tx.setErrorCallback(reject)
        tx.atUpdate(key, value)
        tx.commit() 
    }

    asyncAdd (key, value, resolve, reject) { // private
	    const tx = this.idb().newTx()
	    tx.begin()
        tx.setIsDebugging(this.isDebugging())
        tx.setSucccessCallback(resolve)
        tx.setErrorCallback(reject)
        tx.atAdd(key, value)
        tx.commit() 
    }

    asyncRemoveKey (key, resolve, reject) {
	    const tx = this.idb().newTx()
	    tx.begin()
        tx.setIsDebugging(this.isDebugging())
        tx.setSucccessCallback(resolve)
        tx.setErrorCallback(reject)
        tx.removeAt(key)
        tx.commit() 
    }

}.initThisClass());


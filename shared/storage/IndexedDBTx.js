"use strict";

/* 

    IndexedDBTx

    Abstraction of a single IndexedDB transaction.

*/

(class IndexedDBTx extends ProtoClass {
    initPrototypeSlots () {
        this.newSlot("dbFolder", null)
        this.newSlot("objectStore", null)
        this.newSlot("tx", null)
        this.newSlot("requests", [])
        this.newSlot("isCommitted", false)
        this.newSlot("txRequestStack", null)
        this.newSlot("succcessCallback", null)
        this.newSlot("errorCallback", null)
        this.newSlot("usesStringValuesOnly", false)
    }

    init () {
        super.init()
        this.setIsDebugging(false)
    }

    db () {
        return this.dbFolder().db()
    }
    
    storeName () {
        return this.dbFolder().storeName()
    }
	
    // --- being and commit ---

    assertNotCommitted () {
	    assert(this.isCommitted() === false)
    }

    newTx () {
        assert(Type.isNullOrUndefined(this.tx()))
        const tx = this.db().transaction(this.storeName(), "readwrite")        
        //tx.onerror = (event) => { this.onTxError(event) }
        //tx.onsuccess = (event) => { this.onTxSuccess(event) }

        tx.onerror = (event) => { this.onTxError(event) }
        tx.oncomplete = (event) => { this.onTxSuccess(event) }

        this.setTx(tx)
        return tx
    }

    begin () {
	    this.assertNotCommitted()
        this.setTxRequestStack(this.isDebugging() ? new Error().stack : null)
	    const tx = this.newTx()
        const objectStore = tx.objectStore(this.storeName());
        this.setObjectStore(objectStore)
        return this
    }

    showTxRequestStack () {
        const rs = this.txRequestStack()
        if (rs) { 
            console.log("error stack ", rs)
        }
    }

    onTxError (event) {
        this.showTxRequestStack()
        throw new Error("tx error " + event.target.error)
    }

    onTxSuccess (event) {
        const f = this.succcessCallback()
        if (f) {
            f()
        }
    }
	
    abort () {
	    this.assertNotCommitted()
	    this.tx().abort()
	    return this
    }
	
    commit () {
        this.assertNotCommitted()
        this.setIsCommitted(true)
        if (!Type.isUndefined(this.tx().commit)) {
            this.tx().commit()
        } else {
            console.log("WARNING: no IDBTransation.commit method found for this browser")
        }
	    return this
    }
	
    // --- helpers ---
	
    pushRequest (aRequest) {
	    this.assertNotCommitted()

        const requestStack = this.isDebugging() ? new Error().stack : null
        aRequest.onerror = (event) => {
		    const fullDescription = "writing key '" + aRequest._key + "' on objectStore '" + this.storeName() + "' error: '" + event.target.error + "'"
		    console.warn(fullDescription)
		    if (requestStack) { 
                console.log("error stack ", requestStack)
            }
		  	throw new Error(fullDescription)
        }
	    this.requests().push(aRequest)
	    return this
    }
	
    entryForKeyAndValue (key, value) {
        assert(Type.isString(key))
        if (this.usesStringValuesOnly()) {
            assert(Type.isString(object))
        }
        /*
        if (Type.isNullOrUndefined(object)) {
            throw new Error(this.type() + ".entryForKeyAndValue('" + key + "', ...) can't add null value")
        }
		
        const v = JSON.stringify(object)
        if (v === null) {
            throw new Error("can't add entry for null value")
        }
        */
		
        return { key: key, value: value }
    }
	
    // --- operations ----

    /*
    atPut (key, object) {
	    this.assertNotCommitted()

        if (this.hasKey(key)) {
            this.atUpdate(key, object)
        } else {
            this.atAdd(key, object)
        }
        return this
    }
    */
	
    atAdd (key, object) { 
        //assert(!this.hasKey(key))
        this.assertNotCommitted()
        
        this.debugLog(() => " add " + key + "'" + object + "'")

        const entry = this.entryForKeyAndValue(key, object)
        const request = this.objectStore().add(entry);
        request._action = "add"
        request._key = key 
        /*
        request.onsuccess = function(event) {
            // report the success of the request (this does not mean the item
            // has been stored successfully in the DB - for that you need transaction.onsuccess)

        }
        */
        this.pushRequest(request)
        return this
    }

    atUpdate (key, object) {
        //assert(!this.hasKey(key))
        this.assertNotCommitted()

        this.debugLog(() => " atUpdate " + key)

        const entry = this.entryForKeyAndValue(key, object)
        const request = this.objectStore().put(entry);
        request._action = "put"
        request._key = key
        this.pushRequest(request)
        return this
    }
    
    removeAt (key) {
	    this.assertNotCommitted()

        this.debugLog(() => " removeAt " + key)

        const request = this.objectStore().delete(key);
        request._action = "remove"
        request._key = key
        this.pushRequest(request)
        return this
    }
    
}.initThisClass());





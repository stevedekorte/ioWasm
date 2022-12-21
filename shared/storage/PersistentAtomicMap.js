"use strict";

/*

    PersistentAtomicMap

    An persistent atomic Map implemented as 
    a read & write cache on top of IndexedDB.
    
    On open, it reads the entire db into a dictionary
    so we can do synchronous reads and writes (avoiding IndexedDB's async API),
    and then call the async commit at the end of the event loop.

    Notes:

    - keys and values are assumed to be strings
	- any exception between begin and commit should halt the app and require a restart to ensure consistency

    API:

    - at(key) returns a value from the internal dict
    - begin() shallow copies the current internal dict
    - atPut(key, value) & removeAt(key)
        applies normal op and adds key to changedKeySet
    - revert() reverts changes since begin
    - commit() constructs a transaction using changedKeySet 
	- at(key) first checks the writeCache beforing checking the readCache
		
    TODO: 
    
    - auto sweep after a write if getting full? 
        
*/

(class PersistentAtomicMap extends ideal.AtomicMap {
    initPrototypeSlots () {
        this.newSlot("name", "PersistentAtomicMap")
        this.newSlot("idb", null)
    }

    init () {
        super.init()
        this.setIsOpen(false)
        this.setIdb(IndexedDBFolder.clone())
        //this.setIsDebugging(true)
    }
    
    // open

    open () {
        throw new Error(this.type() + " synchronous open not supported")
        return this
    }

    asyncOpen (callback, errorCallback) {
        this.idb().setPath(this.name())
        this.idb().asyncOpenIfNeeded( () => this.onOpen(callback), errorCallback )
        return this
    }
	
    onOpen (callback, errorCallback) {
        // load the cache
        this.debugLog(" onOpen() - loading cache")
        
        if (false) {
            debugger;
            this.asyncClear(() => this.loadMap(callback, errorCallback))
        } else {
            this.loadMap(callback, errorCallback)
        }
    }

    loadMap (callback, errorCallback) {
        this.idb().asyncAsMap(map => {
            assert(!Type.isNull(map))
            //console.log(this.debugTypeId() + " onOpen() --- loaded cache with " + this.recordsMap().count() + " keys")
            this.setMap(map)
            this.setIsOpen(true)
            
            if (callback) {
                callback()
            }
            
            //this.verifySync(callback, errorCallback)
        })
    }

    // --- close ---

    close () {
        if (this.isOpen()) {
            this.idb().close()
        }
        super.close()
        return this
    }
	
    // ---- clear --- 
		
    asyncClear (successCallback) {
        debugger;
        this.idb().asyncClear(() => {
            this.map().clear()            
            successCallback()
        }) // TODO: lock until callback?
    }
		
    // --- transactions ---

    applyChanges () { // private -- apply changes to idb, super call will apply to map
        const count = this.changedKeySet().size
	    const tx = this.idb().newTx()
	    tx.begin()
        tx.setIsDebugging(this.isDebugging())
        
        this.changedKeySet().forEachKV(k => {
            const v = this.at(k)
           // debugger;
            if (!this.has(k)) {
                tx.removeAt(k)
            } else {
                const isUpdate = this.snapshot().has(k)
                
                if (isUpdate) {
                    tx.atUpdate(k, v)
                } else {
                    tx.atAdd(k, v)
                }                
            }
        })
		
        // indexeddb commits on next event loop automatically
        // this tx.commit() is just a sanity check -  marks the tx as committed so it raises exception 
        // if we attempt to write more to the same tx 
        /*
        if (this.isDebugging()) {
		    tx.setSucccessCallback(() => this.verifySync())
        }
        */
        tx.commit() // TODO: lock until commit callback?

        super.applyChanges() // do this last as it will clear the snapshot
		
        this.debugLog(() => "---- " + this.type() + " committed tx with " + count + " writes ----")
        return count
    }
	
    // --- helpers ---

    verifySync (callback, errorCallback) {
        const currentMap = this.map().shallowCopy()

        this.idb().asyncAsMap(map => {	 
            const isSynced = map.isEqual(currentMap) // works if keys and values are strings
            if (!isSynced) {
                //this.idb().show()
                //console.log("syncdb idb json: ", JSON.stringify(map.asDict(), null, 2))
                throw new Error(his.debugTypeId() + ".verifySync() FAILED")
                errorCallback()
            }
            console.log(this.debugTypeId() + ".verifySync() SUCCEEDED")
            if (callback) {
                callback()
            }
        })
    }
}.initThisClass());


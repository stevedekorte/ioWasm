

require("./getGlobalThis.js")
require("./Base.js")
require("./StrvctHttpsServerRequest.js")

const http = require('http');
const https = require('https');
const fs = require('fs');
//var vm = require('vm')
const nodePath = require('path');


(class StrvctHttpsServer extends Base {
	
	initPrototypeSlots () {
		this.newSlot("server", null);
		this.newSlot("hostname", "localhost");
		this.newSlot("port", 8000);
		this.newSlot("isSecure", false);
	}

	init () {
		super.init()
		return this
	}

	serverKeyPath () {
		return nodePath.join(__dirname, 'keys/server.key')
	}

	serverCertPath () {
		return nodePath.join(__dirname, 'keys/server.crt')
	}

	options () {
		return {
			key: fs.readFileSync(this.serverKeyPath()),
			cert: fs.readFileSync(this.serverCertPath())
		}
	}

	scheme () {
		return this.isSecure() ? "https" : "http";
	}

	run () {
		/*
		require("../source/boot/ResourceManager.js")
		//vm.runInThisContext(fs.readFileSync(__dirname + "/mime_extensions.js"))
		//vm.runInThisContext(fs.readFileSync(__dirname + "/../source/boot/ResourceManager.js"))
		*/

		if (this.isSecure()) {
			this._server = https.createServer(this.options(), (request, response) => { 
				this.onRequest(request, response) 
			})
		} else {
			this._server = http.createServer({}, (request, response) => { 
				this.onRequest(request, response) 
			})	
		}

		this._server.listen(this.port());

		const sandboxPath =  process.cwd()
		console.log(this.type() + ":")
		console.log("  cwd: '" + sandboxPath + "'")
		console.log("  port: " + this.port())
		console.log("  url: " + this.scheme() + "://" + this.hostname() + ":" + this.port() + "/index.html")
	}

	onRequest (request, response) {
		//console.log("got request ", request)
		const r = new StrvctHttpsServerRequest()
		r.setServer(this)
		r.setRequest(request)
		r.setResponse(response)
		//this.wait(10);
		r.process()
	}

	wait (ms) {
		console.log("wait(" + ms + ")");
		const start = Date.now();
		while (Date.now() - start < ms) {
			// do nothing
		}
	}

}.initThisClass());


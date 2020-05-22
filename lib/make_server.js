const exp = require("express");
const body_parser = require("body-parser");
//const Bundler = require('parcel-bundler');

module.exports = (routes,port) => {
	const serv = exp();

	serv.disable('x-powered-by');

	routes.forEach((route) => {
		const meth = route.method;
		const path = route.path;
		const func = route.handler;

		serv[meth](path,func);
	});

	return {
		"listen": ()=> serv.listen(port)
	}
}
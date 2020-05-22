//we can add validators later
const getters = {
	"query":(name,req) => req.query[name],
	"url_param":(name,req) => req.parameters[name],
	"header":(name,req) => req.headers[name]
}

const converters = {
	"number": val => Number(val),
	"bool": val => Boolean(val),
	"string": val => String(val),
	"none": val => val
}

module.exports = (scheme) => (req) =>{
	return scheme.map( param => {
		const getter = getters[param.source];

		if(getter === undefined) {
			throw new error(`parameter ${param.name} is of unknown source ${param.source}`);
		}

		const converter = converters[param.type];

		if(converter === undefined) {
			throw new error(`parameter ${param.name} is of unknown type ${param.type}`);
		}

		const raw = getter(param.name,req);

		if(raw === undefined && param.required) {
			throw new error(`required parameter ${param.name} is missing`);
		}

		return converter(raw);
	});
}
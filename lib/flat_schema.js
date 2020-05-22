//add more when you come across them
const validators = {
	"string":(fieldname,options = {},input) => {
		
		if(typeof input !== "string") {
			return `field ${fieldname} is not of type string`
		}

		if(options.regex && !(RegExp(options.regex).test(input))) {
			return `field ${fieldname} does not match required regular expression ${options.regex}`
		}

		if(options.min_length && !(input.length >= options.min_length)) {
			return `field ${fieldname} does not meet the minimum length of ${options.min_length}`
		}

		if(options.max_length && !(input.length <= options.max_length)) {
			return `field ${fieldname} exceeds the maximum length of ${options.max_length}`
		}

		return undefined
	},

	"number":(fieldname,options = {},input) => {
		
		if(typeof input !== "number") {
			return `field ${fieldname} is not of type number`
		}

		if(options.min && !(input >= options.min)) {
			return `field ${fieldname} does not meet the minimum value of ${options.min}`
		}

		if(options.max && !(input <= options.max_length)) {
			return `field ${fieldname} does not meet the minimum length of ${options.max}`
		}
	}
}

const validate = (fields,obj) => {
	const errors = fields.reduce((errs,field) => {

		const val = obj[field.name];

		if(val === undefined) {
			return errs.concat(`field ${field.name} was not present`);
		}

		const vdator = validators[field.type];
		const v_err = vdator(field.name,field.options,val);

		if(v_err !== undefined) {
			return errs.concat(v_err);
		}

		return errs;
	},[]);

	if(errors.length != 0) {
		const big_msg = `validation errors: \n ${errors.join("\n")}`
		throw new Error(big_msg);
	}

	return true;
}

const default_obj = (defaults,obj) => {
	return {
		...defaults,
		...obj
	}
};

const extract_params = (fields,obj) => fields.map(({name,...rest}) => obj[name])

module.exports = (fields_list) => {
	const defaults = fields_list.reduce( (acc,field) => {
		
		if (field.default !== undefined) {
			acc[field.name] = field.default
		}

		return acc;
	},{})

	return {
		"default": (input) => default_obj(defaults,input),
		"validate": (input) => validate(fields_list,input),
		"params":  (input)=> extract_params(fields_list,input)
	}
}
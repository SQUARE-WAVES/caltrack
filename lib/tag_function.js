const global_tag = require("./global_tag.js");
const make_server = require("./make_server.js");
const async_chain = require("./async_chain.js");
const authentication_step = require("./authentication_step.js");
const pg_pool = require("./pg_pool.js");
const dml_step = require("./dml_step.js");
const query_step = require("./query_step.js");
const flat_schema = require("./flat_schema.js");
const req = require("./req_tag.js");
const param_extractor = require("./param_extractor.js");
const static_handler = require("./static_handler.js");

const canned_response = async (data) => (req,res,next) => {
  res.json(data);
}

const handlers = {
  "txt_handler": (text) => async (id,req,res) => {
		res.send(text);
	},

	"async_chain":async_chain,
  "async_step":async (step) => async_chain({"steps":[step]}),
	"authenticate":authentication_step,
	dml_step,
	query_step,
	static_handler,
  canned_response
}

const formatters = {
  "extract_first_row": async () => (result) => result.rows[0]
}

const tag_table = {
  ...handlers,
	req,
	pg_pool,
  flat_schema,
	param_extractor,

  ...formatters,

  //loggers
	"con_logger":() => console,

  //the server itself
	"server": async ({routes,port}) => make_server(routes,port)
}

module.exports = (globals_table = {}) => {
	const local_tag_table = {
		"global":global_tag(globals_table),
		...tag_table
	}

	return async (tag,val) => {
		const tf = local_tag_table[tag];

		if(tf == undefined)
		{
			throw new Error(`tag ${tag} is invalid`);
		}
		else
		{
			return tf(val);
		}
	}
}

const util= require("util");
const fs = require("fs");
const tj = require("teejay");
const tag_function = require("./lib/tag_function.js");

const read_conf = util.promisify(fs.readFile)

const main = async (env_config_path,conf_path) => {
	const env_config = await read_conf(env_config_path,"utf8");
	const env = await tj(env_config,tag_function());

	const conf = await read_conf(conf_path,"utf8");
	const serv = await tj(conf,tag_function(env));

	serv.listen();
}

const env_path = process.argv[2] || "./conf/test.tj";
const serv_path = process.argv[3] || "./conf/server.tj";

main(env_path,serv_path).then(
	win => console.log("wow, we did it"),
	fail => {
		console.log("oh no it all went wrong")
		console.log(fail.stack)
	}
);

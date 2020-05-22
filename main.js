const util= require("util");
const fs = require("fs");
const tj = require("teejay").promise;
const tag_function = require("./lib/tag_function.js");

const read_conf = util.promisify(fs.readFile)

const main = async () => {
	const env_config = await read_conf("./conf/test.tj","utf8");
	const env = await tj(env_config,tag_function());

	const conf = await read_conf("./conf/server.tj","utf8");
	const serv = await tj(conf,tag_function(env));

	serv.listen();
}

main().then(
	win => console.log("wow, we did it"),
	fail => {
		console.log("oh no it all went wrong")
		console.log(fail.stack)
	}
);
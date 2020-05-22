const vm = require("vm")
const util = require("util")
const fs = require("fs")

const read = util.promisify(fs.readFile)

module.exports = async ({path,dependencies ={}}) => {
	
	if(path === undefined) {	
		throw new Error("you need a path");
	}
	else {
		const txt = await read(path,"utf8");
		const eval_txt = `( (dependencies) => { ${txt} } )`;

		const output = vm.runInNewContext(eval_txt,{});
		return output(dependencies);
	}
}
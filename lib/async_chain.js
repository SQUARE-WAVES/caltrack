const uuid = require("uuid").v4;

const default_error_handler = (id,err,req,res,next) => {
	const status = err.status || 500;

	res.status(status);
	res.send(err.stack);

	console.log(err.stack)

	next();
}

const run_the_chain = async (steps,id,req,res) => {
	for(let i=0;i<steps.length; ++i)
	{
		const step = steps[i];
		await step(id,req,res);
	}
}

module.exports = async ( {steps,error_handler = default_error_handler,do_next = false} ) => (req,res,next) => {
	const id = uuid();

	const post = do_next ? next : () => null;

	run_the_chain(steps,id,req,res).then(
		win=> post(),
		fail => error_handler(id,fail,req,res,post)
	)
}

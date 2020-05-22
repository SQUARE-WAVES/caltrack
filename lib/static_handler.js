const path = require("path");

module.exports = ({root,cache=true}) => (req,res,next) =>{
		const file = req.params.file;

		res.sendFile(file,{
			root,
			cacheControl:cache
		});
	}
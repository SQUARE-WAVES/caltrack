const build_query = (table,fields) => `INSERT into ${table}(${fields.join(",")}) VALUES(${fields.map( (x,i)=>`$${i+1}`).join(",")}) RETURNING id`

const read_body = async (req) => new Promise( (resolve,reject) => {
	let body = '';
	
	req.on('data', chunk => {
		body += chunk.toString(); // convert Buffer to string
	});

	req.on('end', () => {
		try {
			req.body = JSON.parse(body);
			resolve(req.body);
		}
		catch(err){
			reject(err)
		}
	});

	req.on("error", err=> reject(err));
})

module.exports = ({pool,schema,table,fields}) => async (id,req,res) => {

	await read_body(req);
	const input = req.body;

	//a schema has 3 responsibilities:
	//it adds defaults
	const defaulted = schema.default(input);

	//it validates the input (throws an error if it's bad)
	schema.validate(defaulted);
	
	//and it formats it into query params
	const params = schema.params(defaulted);

	//now we just execute the DML query (assuming your query works)
	const q = build_query(table,fields);
	const results = await pool.query(q,params);

	//im pretty sure pg returns shit like this
	console.log(results.rows);

	res.send("who-ray");
}

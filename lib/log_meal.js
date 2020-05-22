const {pg_pool, meal_field, components_field, meal_schema,component_schema,logger} = dependencies;

//we gotta fix this shit
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
});

const meal_query = `INSERT INTO meal(name) VALUES ($1) returning id`;

return async (id,req,res) => {

	const body = await read_body(req);

	const meal = body[meal_field];
	const components = body[components_field];

	meal_schema.validate(meal);
	components.forEach(comp => component_schema.validate(comp));

	const defaulted_meal = meal_schema.default(meal);
	const meal_params = meal_schema.params(defaulted_meal);

	const component_params = components.reduce((a,comp) => {
		const defcomp = component_schema.default(comp);
		return a.concat(component_schema.params(defcomp));
	},[]);

	const client = await pg_pool.connect();

	try{
		await client.query("BEGIN");
		const meal_res = await client.query(meal_query,meal_params);
		const id = meal_res.rows[0].id;

		const component_query_params = [id,...component_params];
		const compnent_dollars = components.map( (c,i) => `($1,$${(2*i)+2},$${(2*i)+3})`).join(',')
		const component_query = `INSERT into component(meal_id,food_id,servings) VALUES ${compnent_dollars}`;

		await client.query(component_query,component_query_params);
		await client.query("COMMIT");
		res.send(id);
	}
	catch(err){
		await client.query("ROLLBACK");
		res.status = 500;
		res.send(err.stack);
	}
}



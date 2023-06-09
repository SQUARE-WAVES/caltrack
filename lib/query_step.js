const default_formatter = (result) => result.rows;

//this lets you do xml or something like that
const default_responder = (formatted,res) => res.json(formatted);

module.exports = ({pool,query,param_extractor = () => [],formatter = default_formatter,responder = default_responder}) => async (id,req,res) => {

	const params = param_extractor(req);
	const qres = await pool.query(query,params);
	const formatted = formatter(qres);

	responder(formatted,res);
}

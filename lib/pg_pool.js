const pg = require("pg");

module.exports = (opts) => {

	const defaulted_opts = {
  	port: 5432,
  	ssl: false,
  	min: 2,
  	max: 20,
  	idleTimeoutMillis: 1000,
  	connectionTimeoutMillis: 1000,
  	maxUses: 7500,
  	...opts
	}

	return new pg.Pool(defaulted_opts);
}
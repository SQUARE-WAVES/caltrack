module.exports = (global_table)=> (val)=> {
	const global_val = global_table[val];

	if(global_val === undefined) {
		throw new Error(`global value ${val} not found`);
	}
	else{
		return global_val
	}
}
const h = require('virtual-dom/h');

const nop = s => s

const coercer = (type) => {
	const tabs = {
		"number":Number,
	}

	return tabs[type] || nop
}

const inputter = (label,type,val,update) => h("div.formo",{},[
	h("label",{},label),
	h("input",{
		"type":type,
		"value":val,
		"oninput": (ev) => update(coercer(type)(ev.srcElement.value))
	},
	[])
])

const render = (state,updates,command) => h("div.form_box",{},[
	inputter("name","text",state.name,updates.set_name),
	inputter("serving_size","number",state.serving_size,updates.set_serving_size),
	inputter("calories","number",state.calories,updates.set_cals),
	inputter("protien","number",state.protien,updates.set_prot),
	inputter("carbs","number",state.carbs,updates.set_carbs),
	inputter("fat","number",state.fat,updates.set_fat),
	h("button",{"onclick":(ev) => command("save_ingredient",save_state(state))},"save")
])

const init = () => {
	return {
		"name":"",
		"serving_size":0,
		"calories":0,
		"protien":0,
		"carbs":0,
		"fat":0	
	}
};

//nothing for now
const save_state = nop;

const updates = (state) => {
	return {
		"set_name":(val) => state.name = val,
		"set_serving_size":(val) => state.serving_size = val,
		"set_cals":(val) => state.calories = val,
		"set_prot":(val) => state.protien = val,
		"set_carbs":(val) => state.carbs = val,
		"set_fat":(val) => state.fat = val
	}
}

module.exports = {
	init,
	render,
	updates
}
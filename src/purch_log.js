import {h} from "./vdprog.js";

const coercer = (type) => {
	const tabs = {
		"number":Number,
	}

	return tabs[type] || (s => s)
}

const inputter = (state,label,type,val,update) => h("div.formo",{},[
	h("label",{},label),
	h("input",{
		"type":type,
    "step":"0.01",
		"value":val,
		"onchange": (ev) => update(state,coercer(type)(ev.srcElement.value))
	},
	[])
])

const format_state = ({budget_id,desc,amt}) => ({budget_id,"description":desc,"amount":Math.round(amt * 100)})

export const render = (state,updates,command) => h("div.form_box",{},[
  inputter(state,"description","text",state.desc,updates.set_desc),
  inputter(state,"amount","number",state.amt,updates.set_amt),
  h("button",{"onclick":(ev) => command("log_purchase",format_state(state))},"log")
]);

export const init = (budget_id) => {
  return {
    budget_id,
    "desc":"",
    "amt":0.0
  }
}

export const updates = {
  "set_desc":(state,val) => state.desc = val,
  "set_amt":(state,val) => state.amt = val
}

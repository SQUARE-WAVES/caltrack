//this is annoying!
import "babel-polyfill"

const h = require('virtual-dom/h');
const diff = require('virtual-dom/diff');
const patch = require('virtual-dom/patch');
const createElement = require('virtual-dom/create-element');

const qs = require("querystring");

//the comps
const picker = require("./ingredient_picker.js");
const daily_meals = require("./daily_meals.js");

const prog = (state,render,updates) => {
	
	const wrap_table = (table) => {
		return Object.keys(table).reduce( (a,k) => {
			const val = table[k];

			if(typeof val === "function"){
				a[k] = (...args) => {
					val(...args),
					re_render();
				}
			}
			else if (typeof val === "object"){
				a[k] = wrap_table(val)
			}
			else{
				a[k] = val;
			}

			return a;
		},{})
	}

	const update_table = wrap_table(updates);

	const command_table = {
		"log_meal": async (meal_data) => {
			const datums = JSON.stringify(meal_data);
			const res = await fetch("./meal",{
				"method":"POST",
				"mode":"same-origin",
				"headers":{
					"Content-Type":"application/json",	
				},
				"body":datums
			})
		}
	}

	const command = async (cm,...args) => {
		const to_exc = command_table[cm];

		if(to_exc === undefined){
			console.log(`unknown command ${cm}`)
			return;
		}
		
		await to_exc(...args);
	}

	//this is annoying but I'm not sure how to do it otherwise
	const progstate = {};

	const re_render = () => {
		const new_tree = render(state,update_table,command);
		const patcho = diff(progstate.tree,new_tree);
		progstate.root = patch(progstate.root,patcho);
		progstate.tree = new_tree;
	}

	//now do the setup
	progstate.tree = render(state,update_table,command);
	progstate.root = createElement(progstate.tree);
	document.body.appendChild(progstate.root);
}

const fetch_greeds = () => fetch("./ingredients").then( result => result.json())
const fetch_meals = () => fetch(`./meals_by_date?${qs.stringify(daily_meals.date_range())}`).then(result => result.json())

const leadup = async () => {
	const [ingreeds,meals] = await Promise.all([fetch_greeds(),fetch_meals()]);

	const state = {
		"tab":"daily",
		"daily": daily_meals.init(meals),
		"log": picker.init(ingreeds)
	}

	const updates = {
		"log":picker.updates(state.log),
		"daily":daily_meals.updates(state.daily),
		"switch_tab": (tab) => {
			state.tab = tab;
		}
	};
	
	const render = (state,updates,command) => {

		const log_tab = h("span.spaced.tab",{
			"style":{
				"background": state.tab==="log"? "grey" : "white"
			},
			onclick:(ev)=>updates.switch_tab("log")
		},
		"log")

		const daily_tab = h("span.spaced.tab",{
			"style":{
				"background": state.tab==="daily"? "grey" : "white"
			},
			onclick:(ev)=>updates.switch_tab("daily")
		},
		"daily")

		const child = state.tab == "daily" ? daily_meals.render(state.daily,updates.daily) : picker.render(state.log,updates.log,command);

		return h("div.p-4.cen_tx",{},[
			h("div.p-4.cen_flx.underline",{},[log_tab,daily_tab]),
			child
		])
	};

	prog(state,render,updates);
}

leadup();
//do some leadup
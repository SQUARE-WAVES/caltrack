import {h} from "./vdprog.js"

const nop = () => undefined;

const format_ingredient = (ing) => {
	return{
		...ing,
		"selected":false,
		"servings":0,
		inline_edits:{
			"grams":false,
			"servings":false
		}
	}
}

export const init = (start_ingredients = []) => {
	return {
		"all_ingredients": start_ingredients.map(format_ingredient),
		"filter":"",
		"name":"default",
		"inline_edits":{
			"name":false
		}
	}
}

const save_state = ({name,all_ingredients}) => {
	const components = all_ingredients.filter( x=> x.selected).map( ({id,servings}) => {
		return {
			food_id:id,
			servings
		};
	});

	return {
		"meal":{name},
		components
	}
}

//you do it like this to bind the state in!
export const updates ={
	"add_ingredients":(state,ingreedos) => {
		const dedupe = new Set(state.all_ingredients.map(x => x.id));
		
		//add the new boys we can worry about sorting later
		state.all_ingredients = ingreedos.reduce( (all,ing) => {

			if (!dedupe.has(ing.id)){
				all.push(format_ingredient(ing));
			}

			return all;
		},state.all_ingredients);

		state.filter = "";
	},

	"set_filter":(state,filter_text) => {
		state.filter = filter_text;
	},

	"edit_name":(state,toggle = true) => {
		state.inline_edits.name=toggle;
	},

	"set_name":(state,name_txt) => {
		state.name = name_txt;
		state.inline_edits.name=false;
	},

	"select":(state,ing)=>{
		ing.selected = !ing.selected
	},

	"comp_row":{
		"set_servings": (ing,servs) => {
			ing.servings = servs;
			ing.inline_edits.servings = false;
			ing.inline_edits.grams = false;
		},

		"set_grams": (ing,grams) =>{
			ing.servings = grams/ing.serving_size_grams;
			ing.inline_edits.servings = false;
			ing.inline_edits.grams = false;
		},

		"edit_grams":(ing,toggle = true) => {
			ing.inline_edits.grams = toggle;
		},

		"edit_servings":(ing,toggle = true) => {
			ing.inline_edits.servings = toggle;
		}
	}
}

const render_picklist = (state,updates) => {
	const filtered_ingredients = state.all_ingredients.filter( x => (x.name.toLowerCase().indexOf(state.filter.toLowerCase()) != -1));

	const ingredient_entry = ingredient => h('div.p-1',{
		"style":{
			"background-color":ingredient.selected? "cyan":""
		},
		"onclick":(ev)=> updates.select(state,ingredient)
	},[
		h('label',{},ingredient.name)
	]);

	return [
		h("label",{},"filter: "),
		h("input",{
			"type":"text",
			"value":state.filter,
			"oninput": (ev) => updates.set_filter(state,ev.srcElement.value)
		},[]),

		h("div.picklist.underline.p-4",{},filtered_ingredients.map( ingredient_entry))
	]
}

const render_component = (state,updates) => {
	
	const gram_cell = (state,updates) => {
		if(state.inline_edits.grams){
			return h("td",{},[
				h("input",{
					"type":"number", 
					"value":state.servings * state.serving_size_grams, 
					"onchange": (ev) => updates.comp_row.set_grams(state,Number(ev.srcElement.value)),
					"onblur":(ev) => updates.comp_row.edit_grams(state,false),
          "hooks":[
            (node) => {
              node.focus();
              setTimeout(()=>node.focus(),0);
            }
          ]

				})
			]);
		}
		else{
			return h("td",{
				onclick:() => updates.comp_row.edit_grams(state)
			},
			[
				(state.servings*state.serving_size_grams).toFixed(4)
			]);
		}
	}

	const serv_cell = (state,updates) => {
		if(state.inline_edits.servings){
			return h("td",{},[
				h("input",{
					"type":"number", 
					"value":state.servings, 
					"onchange": (ev) => updates.comp_row.set_servings(state,Number(ev.srcElement.value)),
					"onblur":(ev) => updates.comp_row.edit_servings(state,false),
          "hooks":[
            (node) => {
              node.focus();
              setTimeout(()=>node.focus(),0);
            }
          ]
				})
			]);
		}
		else{
			return h("td",{
				onclick:() => updates.comp_row.edit_servings(state)
			},
			[
				state.servings.toFixed(4)
			]);
		}
	}

	return h("tr.zebra",{},[
		h("td",{},[state.name]),
		h("td",{},[`${(state.calories * state.servings).toFixed(2)}`]),
		h("td",{},[`${(state.protien * state.servings).toFixed(2)}`]),
		h("td",{},[`${(state.carbs * state.servings).toFixed(2)}`]),
		h("td",{},[`${(state.fat * state.servings).toFixed(2)}`]),
		serv_cell(state,updates),
		gram_cell(state,updates)
	])
}

const render_meal = (state,updates,command = nop) =>{ 
	//the inline edit widget for the name
	const name = ()=> {
		if(state.inline_edits.name){
			return h("input.cen_tx",{
				"type":"text",
				"value":state.name,
				"onchange": (ev) => updates.set_name(state,ev.srcElement.value),
				"onblur":(ev) => updates.edit_name(state,false),
				"hooks":[
          (node) => {
            node.focus();
            setTimeout(()=>node.focus(),0);
          }
        ]
			},[]);
		}
		else{
			return h("span.cen_tx",{
				"onclick": (ev) => updates.edit_name(state)
			},[state.name]);
		}
	}

	const table_header = h("thead",{},[
		h("th",{},"name"),
		h("th",{},"calories"),
		h("th",{},"protien"),
		h("th",{},"carbs"),
		h("th",{},"fat"),
		h("th",{},"servings"),
		h("th",{},"grams")
	])

	const comps = state.all_ingredients.filter( x=> x.selected)

	const comp_rows = state.all_ingredients.filter( x=> x.selected).map( x => render_component(x,updates));

	//this for now
	if(comps.length != 0){
		const totals = comps.reduce( (acc,row) =>{
			acc.calories += row.calories * row.servings;
			acc.protien += row.protien * row.servings;
			acc.carbs += row.carbs * row.servings;
			acc.fat += row.fat * row.servings;
			return acc;
		},{calories:0,protien:0,carbs:0,fat:0})

		comp_rows.push(h("tr",{},[h("td.h-4.border-top.border-black",{},"     ")]));

		comp_rows.push(h("tr.negative",{},[
			h("td",{},"TOTALS"),
			h("td",{},`${(totals.calories).toFixed(2)}`),
			h("td",{},`${(totals.protien).toFixed(2)}`),
			h("td",{},`${(totals.carbs).toFixed(2)}`),
			h("td",{},`${(totals.fat).toFixed(2)}`),
			h("td",{},"---"),
			h("td",{},"---"),
		]));
	}

	const table = h("table",{},[
		table_header,
		h("tbody",{},comp_rows)
	]);

	const widgets = [
		name(),
		h("div.p-4",{},"meal components"),
		table
	]

	if(comp_rows.length != 0) {
		widgets.push( h("div",{},[
			h("button",{
				"onclick":() => command("log_meal",save_state(state))
			},["save"])
		]));
	}

	return widgets;
}

export const render = (state,updates,command = nop) => h("div.p-4",{},[
	...render_picklist(state,updates),
	...render_meal(state,updates,command)
])

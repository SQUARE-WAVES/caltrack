import {h,vdom_loop} from "./vdprog.js"

//the comps
import * as picker from "./ingredient_picker.js"
import * as daily_meals from "./daily_meals.js"
import * as new_ingredient from "./new_ingreedient.js"

const qs_stringify = (obj) => Object.entries(obj).map( ([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")

const fetch_greeds = () => fetch("./ingredients").then( result => result.json())
const fetch_meals = () => fetch(`./meals_by_date?${qs_stringify(daily_meals.date_range())}`).then(result => result.json())

const leadup = async () => {
	const [ingreeds,meals] = await Promise.all([fetch_greeds(),fetch_meals()]);

	const state = {
		"tab":"daily",
		"daily": daily_meals.init(meals),
		"log": picker.init(ingreeds),
		"new_greed": new_ingredient.init()
	}

	const updates = {
		"log":picker.updates,
		"daily":daily_meals.updates,
		"new_greed":new_ingredient.updates,
		"switch_tab": (tab) => {
			state.tab = tab;
		}
	};

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
      });

	    const meals = await fetch_meals();

	    state.daily = daily_meals.init(meals);
	    state.log = picker.init(state.log.all_ingredients);
	    state.tab = "daily";
    },

  	"save_ingredient":async (new_greedo) =>{
  	  const datums = JSON.stringify(new_greedo);
  		await fetch("./ingredient",{
  		  "method":"POST",
  			"mode":"same-origin",
  			"headers":{
  				"Content-Type":"application/json",	
  			},
  			"body":datums
  		});
  
  		const ingreeds = await fetch_greeds();
  
  		state.log = picker.init(ingreeds);
  		state.new_greed= new_ingredient.init();
  		state.tab = "daily";
  	}
  }

  const command = async (cm,...args) => {
    const to_exc = command_table[cm];

    if(to_exc === undefined){
	    console.log(`unknown command ${cm}`)
		  return;
	  }
		
	  await to_exc(...args);
    vdl.go();
  }
	
	const render = (state,updates) => {

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

		const new_greed_tab = h("span.spaced.tab",{
			"style":{
				"background": state.tab==="new_greed"? "grey" : "white"
			},
			onclick:(ev)=>updates.switch_tab("new_greed")
		},
		"new ingredient")

		const tab_val = {
			"daily": () =>daily_meals.render(state.daily,updates.daily),
			"new_greed": () => new_ingredient.render(state.new_greed,updates.new_greed,command),
			"log": () => picker.render(state.log,updates.log,command)
		}

		const child = tab_val[state.tab]();

		return h("div.p-4.cen_tx",{},[
			h("div.p-4.cen_flx.underline",{},[log_tab,daily_tab,new_greed_tab]),
			child
		])
	};
  
  const vdl = vdom_loop(document.querySelector('body'),state,updates,render)

  vdl.go();
}

leadup();

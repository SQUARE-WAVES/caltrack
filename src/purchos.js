import {h,vdom_loop} from "./vdprog.js"

//the comps
import * as log_form from "./purch_log.js"
import * as weeklys from "./weekly_purchos.js"

const qs_stringify = (obj) => Object.entries(obj).map( ([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")

const leadup = async () => {

  const purchases = await weeklys.fetch_purchases();

  const state = {
    "tab": "weekly",
    "log": log_form.init(purchases.budget_id),
    "weekly":weeklys.init(purchases)
  };

  const updates = {
    "switch_tab": (tab) => state.tab = tab,
    "log": log_form.updates,
    "weekly": weeklys.updates
  }

  const command_table = {
    "log_purchase": async(purchase) => {
      const datums = JSON.stringify(purchase);
      const res = await fetch("./purcho",{
  		  "method":"POST",
  			"mode":"same-origin",
  			"headers":{
  				"Content-Type":"application/json",	
  			},
  			"body":datums
  		});

      const all_purch = await weeklys.fetch_purchases(0,9999999999);
      state.weekly = weeklys.init(all_purch);
      state.tab = "weekly";
    }
  }

  const command = async (name,...args) => {
    const to_exc = command_table[name];

    if(to_exc === undefined){
	    console.log(`unknown command ${name}`)
		  return;
	  }
		
	  const res = await to_exc(...args);
    vdl.go();
  }

  const render = (state,updates) => {
    const log_tab = h("span.spaced.tab",{
			"style":{
				"background": state.tab==="log"? "grey" : "white"
			},
			"onclick":(ev)=>updates.switch_tab("log")
		},
		"log");

    const weekly_tab = h("span.spaced.tab",{
      "style":{
        "background": state.tab==="weekly"? "grey" : "white"
      },
      "onclick":(ev)=>updates.switch_tab("weekly")
    },
    "weeklys");

    const tab_funcs = {
      "weekly": () => weeklys.render(state.weekly,updates.weekly,command),
      "log": () => log_form.render(state.log,updates.log,command)
    }

    const child = tab_funcs[state.tab]();

    return h("div.p-4.cen_tx",{},[
			h("div.p-4.cen_flx.underline",{},[weekly_tab,log_tab]),
			child
		])
  }

  const vdl = vdom_loop(document.querySelector('body'),state,updates,render)
  vdl.go();
}

leadup();



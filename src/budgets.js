import {h} from "./vdprog.js"

export const budget_picker = { 
  "init" : (budgets) => ([...budgets]),
  
  "updates": {
    "new_budgets":init
  },
  
  "render":(state,updates,command)=> {
    const budget_row = (b,i) => h(
      "div.budget_name",
      {
        "onclick":(ev) => command.select_budget(i)
      },
      b.name);

    return h("div",{},state.map(budget_row);
  }
}

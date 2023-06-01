import {h} from "./vdprog.js"

export const fetch_purchases = (start_date,end_date) => fetch(`./purchos?start=${start_date}&end=${end_date}`).then( result=>result.json());

export const init = (purchases) => {
  const total_spend = purchases.filter( p=> p.amount >0).reduce( (a,p) => a + p.amount, 0);
  const total_income = purchases.filter( p=> p.amount < 0).reduce( (a,p) => a + p.amount, 0);

  return {
    purchases,
    "expenditures": total_spend,
    "income": total_income,
    "total":total_spend - total_income
  }
}

export const updates = {
  "new_purchases":init
}

const render_purch = (purch) => h("tr.zebra",{},[
  h("td",{},purch.date),
  h("td",{},purch.description),
  h("td",{},`$${purch.amount.toFixed(2)}`)
]);

export const render = (state,updates) => {
  const header = h("thead",{},[
    h("th",{},"date"),
    h("th",{},"description"),
    h("th",{},"amount")
  ]);

  const rows = state.purchases.map(render_purch);

  const body = h("tbody",{},[
    ...rows,
    h("tr",{},[h("td",{},"TOTALS"),h("td",{},"spend"),h("td",{},"income"),h("td",{},"impact")]),
    h("tr.negative",{},[
      h("td",{},"------"),
      h("td",{},`${state.expenditures.toFixed(2)}`),
      h("td",{},`${state.income.toFixed(2)}`),
      h("td",{},`${state.total.toFixed(2)}`)
    ])
  ]);

  return h("div",{},h("table",{},[header,body]));
}



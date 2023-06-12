import {h} from "./vdprog.js"

export const fetch_purchases = async () =>{
  const r1 = await fetch(`./budget`);
  const budge = await r1.json();
  const r2 = await fetch(`./weeklys?budget_id=${budge.id}`);
  const res = await r2.json();

  if(res.length === 0) {
    return {
      "budget_id": budge.id,
      "weekly_allowance": budge.weekly_allowance,
      "purchases": [],
      "spend": 0,
      "income": 0,
      "remains": budge.weekly_allowance
    }
  }
  else {
    return res[0]
  }
}

export const init = ({budget_id,weekly_allowance,purchases,spend,income,remains}) => {

  return {
    budget_id,
    weekly_allowance,
    purchases,
    spend,
    income,
    remains
  }
}

export const updates = {
  "new_purchases":init
}

const format_date = (date) => {
  const dt = new Date(date);

  const days = [
    "sun",
    "mon",
    "tues",
    "weds",
    "thurs",
    "fri",
    "sat",
  ];

  const day = days[dt.getDay()];
  const string = dt.toLocaleDateString();

  return `${day} - ${string}`
}

const render_purch = (purch) => h("tr.zebra",{},[
  h("td",{},format_date(purch.date)),
  h("td",{},purch.description),
  h("td",{},`$${(purch.amount/100).toFixed(2)}`)
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
    h("tr",{},[h("td",{},"TOTALS"),h("td",{},"spend"),h("td",{},"income"),h("td",{},"remaining")]),
    h("tr.negative",{},[
      h("td",{},"------"),
      h("td",{},`${(state.spend/100).toFixed(2)}`),
      h("td",{},`${(state.income/100).toFixed(2)}`),
      h("td",{},`${(state.remains/100).toFixed(2)}`)
    ])
  ]);

  return h("div",{},h("table",{},[header,body]));
}



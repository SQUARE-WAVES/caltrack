const h = require('virtual-dom/h');

const date_range = () => {
	const start_date = new Date();
	
	if(start_date.getHours() <= 5) {
		//5:00am the previous morning
		start_date.setHours(-19,0,0,0);
	}
	else {
		//5:00am this morning
		start_date.setHours(5,0,0,0)
	}

	const end_date = new Date();

	if(end_date.getHours() <= 5) {
		//5:00am this morning (you are checking before 5)
		end_date.setHours(5,0,0,0);
	}
	else {
		//5:00am the next morning
		end_date.setHours(29,0,0,0)
	}

	//postgres timestamps are in seconds, which is plenty for us
	//so we will truncate these instead of letting the query do it
	//so the query is easier to understand
	return {
		"start_date":Math.round(start_date.getTime() /1000),
		"end_date":Math.round(end_date.getTime()/1000)
	};
}

const init = (baked_in_meals = []) => {
	const meals = baked_in_meals.reduce((acc,m) =>{
		acc.set(m.id,m);
		return acc;
	}, new Map());

	return {
		"loading":meals.size === 0,
		meals
	}
}

//this is kinda dead code right now
const updates = {
	"add_meals": (state,to_add) => {
		to_add.forEach( m => state.meals.set(m.id,m))
		state.loading = false;
	}
}

const render_meal = (meal) =>{

	return h("tr.zebra",{},[
		h("td",{},meal.name),
		h("td",{},`${(meal.calories).toFixed(2)}`),
		h("td",{},`${(meal.protien).toFixed(2)}`),
		h("td",{},`${(meal.carbs).toFixed(2)}`),
		h("td",{},`${(meal.fat).toFixed(2)}`),
		h("td",{},meal.date)
	]);
}

//no updates or commands here, 
const render = (state) => {
	const totals = [...state.meals.values()].reduce( (acc,meal) => {
		acc.calories += meal.calories;
		acc.protien += meal.protien;
		acc.carbs += meal.carbs;
		acc.fat += meal.fat;

		return acc;
	},{"calories":0,"protien":0,"carbs":0,"fat":0});


	const meal_rows = [...state.meals.values()].map(render_meal);

	const table_header = h("thead",{},[
		h("th","name"),
		h("th","calories"),
		h("th","protien"),
		h("th","carbs"),
		h("th","fat"),
		h("th","time")
	])

	const body_rows = [
		...meal_rows,
		h("tr",{},h("td",{},"     ")),
		h("tr.negative",{},[
			h("td",{},"TOTALS"),
			h("td",{},`${(totals.calories).toFixed(2)}`),
			h("td",{},`${(totals.protien).toFixed(2)}`),
			h("td",{},`${(totals.carbs).toFixed(2)}`),
			h("td",{},`${(totals.fat).toFixed(2)}`),
			h("td",{},"---")
		])
	]


	return h("div",{},
		h("table",{},[
			table_header,
			h("tbody",{},body_rows)
		])
	)
}

module.exports = {
	init,
	render,
	updates,
	date_range
}
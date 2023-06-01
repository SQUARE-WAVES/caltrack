export const this_week = () => {

  //this is 5am monday morning, days shift over at 5am because thats the LAW
  const monday = new Date();
  monday.setDate(monday.getDate() + (1 - monday.getDay()));
  monday.setHours(5,0,0,0);

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 7);

  return [monday,sunday]
}


//from 5am this morning to 5am tomorrow
export const this_day = () => {
  const today = new Date();

	if(today.getHours() <= 5) {
		//5:00am the previous morning
		today.setHours(-19,0,0,0);
	}
	else {
		//5:00am this morning
		today.setHours(5,0,0,0)
	}

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [today,tomorrow]
}

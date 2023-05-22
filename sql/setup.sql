CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
/*									TABLES!																*/
/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

CREATE TABLE IF NOT EXISTS meal
(
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS food_item
(
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	name TEXT NOT NULL,
	calories DOUBLE PRECISION NOT NULL,
	serving_size_grams DOUBLE PRECISION NOT NULL,
	protien DOUBLE PRECISION NOT NULL,
	carbs DOUBLE PRECISION NOT NULL,
	fat DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS component
(
	servings DOUBLE PRECISION NOT NULL,
	meal_id UUID REFERENCES meal(id) ON DELETE CASCADE,
	food_id UUID REFERENCES food_item(id) ON DELETE RESTRICT,
	PRIMARY KEY (meal_id,food_id)
);

CREATE OR REPLACE VIEW full_component AS
SELECT 
	food.id as food_id, 
	component.meal_id as meal_id, 
	component.servings as servings,
	(food.calories * component.servings) as calories,
	(food.protien * component.servings) as protien,
	(food.fat * component.servings) as fat,
	(food.carbs * component.servings) as carbs
FROM component JOIN food_item AS food ON component.food_id = food.id;

CREATE TABLE IF NOT EXISTS purchase
(
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS targets
(
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'
);

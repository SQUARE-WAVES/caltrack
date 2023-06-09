CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
/*									TABLES!																*/
/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

CREATE TABLE IF NOT EXISTS budget
(
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  open_date TIMESTAMP NOT NULL,
  weekly_allowance INTEGER NOT NULL DEFAULT 25000,
  open_amount INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchase
(
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  budget_id UUID REFERENCES budget(id) ON DELETE RESTRICT, 
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL
);

CREATE OR REPLACE VIEW weekly_purchases AS
SELECT 
  b.id as budget_id,
  b.weekly_allowance as weekly_allowance,
  json_agg(json_build_object('id',p.id,'date',p.date,'description',p.description,'amount',p.amount)) as purchases,
  SUM(CASE WHEN amount < 0 THEN 0 WHEN amount >=0 THEN amount END)::integer as spend,
  SUM(CASE WHEN amount < 0 THEN -amount WHEN amount >=0 THEN 0 END)::integer as income,
  weekly_allowance - SUM(amount)::integer AS remains,
  date_trunc('week',date) AS week
FROM (SELECT * FROM purchase ORDER BY date) AS p JOIN budget AS b ON p.budget_id = b.id 
GROUP BY week,b.id,b.weekly_allowance

// SQL quick reference — one concise, indexable page per command/operator/concept.
// Examples use the SQLingo sample tables (customers, restaurants, orders) so they
// run as-is in the interactive course. Rendered by app/sql-reference/[topic]/page.js.

export const categories = [
  "Query clauses",
  "Operators",
  "Joins",
  "Set operations",
  "Functions",
  "Advanced",
  "Data definition",
  "Data modification",
  "Constraints",
  "Dialects & differences",
  "Theory",
];

export const entries = [
  // ---------- Query clauses ----------
  {
    slug: "select", name: "SELECT", category: "Query clauses",
    summary: "Get data from a table by choosing which columns to return.",
    syntax: "SELECT column1, column2 FROM table_name;",
    examples: [
      { code: "SELECT name, city FROM customers;", note: "Return two columns for every customer." },
      { code: "SELECT * FROM restaurants;", note: "The star (*) returns every column." },
    ],
    related: ["where", "distinct", "aliases"],
  },
  {
    slug: "where", name: "WHERE", category: "Query clauses",
    summary: "Keep only the rows that match a condition.",
    syntax: "SELECT columns FROM table_name WHERE condition;",
    examples: [
      { code: "SELECT * FROM restaurants WHERE city = 'Mumbai';", note: "Only Mumbai restaurants." },
      { code: "SELECT * FROM restaurants WHERE rating >= 4.5;", note: "Compare with =, >, <, >=, <=, <>." },
    ],
    related: ["and-or-not", "in", "between", "like", "is-null"],
  },
  {
    slug: "distinct", name: "DISTINCT", category: "Query clauses",
    summary: "Remove duplicate rows so each value appears only once.",
    syntax: "SELECT DISTINCT column FROM table_name;",
    examples: [
      { code: "SELECT DISTINCT city FROM customers;", note: "Each city once, even if many customers share it." },
    ],
    related: ["select", "group-by"],
  },
  {
    slug: "order-by", name: "ORDER BY", category: "Query clauses",
    summary: "Sort the result by one or more columns.",
    syntax: "SELECT columns FROM table_name ORDER BY column [ASC|DESC];",
    examples: [
      { code: "SELECT name, rating FROM restaurants ORDER BY rating DESC;", note: "Highest rating first. ASC (default) is lowest first." },
      { code: "SELECT * FROM restaurants ORDER BY city ASC, rating DESC;", note: "Sort by city, then rating within each city." },
    ],
    related: ["limit", "group-by"],
  },
  {
    slug: "limit", name: "LIMIT / OFFSET", category: "Query clauses",
    summary: "Return at most N rows; OFFSET skips some first (used for pages).",
    syntax: "SELECT columns FROM table_name ORDER BY column LIMIT n OFFSET m;",
    examples: [
      { code: "SELECT * FROM restaurants ORDER BY rating DESC LIMIT 3;", note: "Top 3 by rating." },
      { code: "SELECT * FROM restaurants ORDER BY id LIMIT 2 OFFSET 2;", note: "Skip 2 rows, then take 2 (page 2)." },
    ],
    notes: "SQL Server uses TOP or OFFSET ... FETCH instead of LIMIT.",
    related: ["order-by"],
  },
  {
    slug: "group-by", name: "GROUP BY", category: "Query clauses",
    summary: "Collapse rows into groups so you can summarise each group.",
    syntax: "SELECT column, COUNT(*) FROM table_name GROUP BY column;",
    examples: [
      { code: "SELECT city, COUNT(*) AS n FROM customers GROUP BY city;", note: "How many customers in each city." },
    ],
    related: ["having", "aggregate-functions"],
  },
  {
    slug: "having", name: "HAVING", category: "Query clauses",
    summary: "Filter groups after GROUP BY (WHERE filters rows before grouping).",
    syntax: "SELECT column, COUNT(*) FROM table_name GROUP BY column HAVING condition;",
    examples: [
      { code: "SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING COUNT(*) > 1;", note: "Only cities with more than one customer." },
    ],
    related: ["group-by", "where"],
  },
  {
    slug: "aliases", name: "Aliases (AS)", category: "Query clauses",
    summary: "Give a column or table a temporary, readable name.",
    syntax: "SELECT column AS alias_name FROM table_name AS t;",
    examples: [
      { code: "SELECT cost_for_two / 2 AS per_person FROM restaurants;", note: "Rename a calculated column." },
      { code: "SELECT c.name FROM customers AS c;", note: "A short table alias makes joins tidier." },
    ],
    related: ["select", "inner-join"],
  },

  // ---------- Operators ----------
  {
    slug: "and-or-not", name: "AND, OR, NOT", category: "Operators",
    summary: "Combine or negate conditions in WHERE.",
    syntax: "WHERE condition1 AND condition2 OR NOT condition3;",
    examples: [
      { code: "SELECT * FROM restaurants WHERE city = 'Mumbai' AND rating >= 4.5;", note: "Both must be true." },
      { code: "SELECT * FROM restaurants WHERE cuisine = 'Pizza' OR cuisine = 'Burgers';", note: "Either can be true." },
    ],
    notes: "AND binds tighter than OR — use parentheses to be explicit.",
    related: ["where", "in"],
  },
  {
    slug: "in", name: "IN", category: "Operators",
    summary: "Check whether a value matches any item in a list.",
    syntax: "WHERE column IN (value1, value2, ...);",
    examples: [
      { code: "SELECT * FROM customers WHERE city IN ('Mumbai', 'Delhi');", note: "Shorter than city = 'Mumbai' OR city = 'Delhi'." },
    ],
    notes: "Prefer NOT EXISTS over NOT IN when the list may contain NULL.",
    related: ["and-or-not", "between", "exists"],
  },
  {
    slug: "between", name: "BETWEEN", category: "Operators",
    summary: "Check whether a value falls within a range (inclusive).",
    syntax: "WHERE column BETWEEN low AND high;",
    examples: [
      { code: "SELECT * FROM restaurants WHERE rating BETWEEN 4.0 AND 4.5;", note: "Includes both 4.0 and 4.5." },
    ],
    related: ["in", "where"],
  },
  {
    slug: "like", name: "LIKE & wildcards", category: "Operators",
    summary: "Match text by pattern: % is any characters, _ is exactly one.",
    syntax: "WHERE column LIKE 'pattern';",
    examples: [
      { code: "SELECT * FROM customers WHERE name LIKE 'A%';", note: "Names starting with A." },
      { code: "SELECT * FROM restaurants WHERE name LIKE '%ing%';", note: "Contains 'ing'." },
    ],
    notes: "A leading wildcard ('%x') usually cannot use an index.",
    related: ["where"],
  },
  {
    slug: "is-null", name: "IS NULL", category: "Operators",
    summary: "Test for missing (NULL) values — never use = NULL.",
    syntax: "WHERE column IS NULL;   -- or IS NOT NULL",
    examples: [
      { code: "SELECT * FROM orders WHERE rating_given IS NULL;", note: "Orders with no rating. = NULL always matches nothing." },
    ],
    related: ["where", "coalesce"],
  },
  {
    slug: "exists", name: "EXISTS", category: "Operators",
    summary: "True if a subquery returns any row; great for 'is there a match?'.",
    syntax: "WHERE EXISTS (SELECT 1 FROM other WHERE ...);",
    examples: [
      { code: "SELECT name FROM customers c\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);", note: "Customers who have at least one order." },
    ],
    related: ["in", "subquery"],
  },
  {
    slug: "comparison-operators", name: "Comparison operators", category: "Operators",
    summary: "Compare two values: = equal, <> not equal, and <, >, <=, >=.",
    syntax: "WHERE column = value;   -- also <>, <, >, <=, >=",
    examples: [
      { code: "SELECT * FROM orders WHERE amount > 500;", note: "Orders above 500." },
      { code: "SELECT * FROM restaurants WHERE cuisine <> 'Pizza';", note: "Everything except pizza. Some databases also allow !=." },
    ],
    related: ["where", "and-or-not"],
  },

  // ---------- Joins ----------
  {
    slug: "inner-join", name: "INNER JOIN", category: "Joins",
    summary: "Return only rows that have a match in both tables.",
    syntax: "SELECT ... FROM a INNER JOIN b ON a.key = b.key;",
    examples: [
      { code: "SELECT o.id, c.name, o.amount\nFROM orders o INNER JOIN customers c ON o.customer_id = c.id;", note: "Each order paired with its customer. Orders with no matching customer are dropped." },
    ],
    related: ["left-join", "cross-join", "aliases"],
  },
  {
    slug: "left-join", name: "LEFT JOIN", category: "Joins",
    summary: "Return all rows from the left table, plus matches from the right (NULLs where none).",
    syntax: "SELECT ... FROM a LEFT JOIN b ON a.key = b.key;",
    examples: [
      { code: "SELECT c.name, o.amount\nFROM customers c LEFT JOIN orders o ON o.customer_id = c.id;", note: "Every customer, even those with no orders (amount is NULL)." },
    ],
    notes: "Putting a right-table condition in WHERE turns a LEFT JOIN into an INNER JOIN — put it in ON instead.",
    related: ["inner-join", "right-join", "full-outer-join"],
  },
  {
    slug: "right-join", name: "RIGHT JOIN", category: "Joins",
    summary: "Return all rows from the right table, plus matches from the left. The mirror of LEFT JOIN.",
    syntax: "SELECT ... FROM a RIGHT JOIN b ON a.key = b.key;",
    examples: [
      { code: "SELECT c.name, o.amount\nFROM orders o RIGHT JOIN customers c ON o.customer_id = c.id;", note: "Every customer kept. Often written as a LEFT JOIN with the tables swapped." },
    ],
    notes: "SQLite added RIGHT JOIN in version 3.39; older versions only have LEFT JOIN.",
    related: ["left-join", "full-outer-join"],
  },
  {
    slug: "full-outer-join", name: "FULL OUTER JOIN", category: "Joins",
    summary: "Return all rows from both tables, matched where possible.",
    syntax: "SELECT ... FROM a FULL OUTER JOIN b ON a.key = b.key;",
    examples: [
      { code: "SELECT c.name, o.amount\nFROM customers c FULL OUTER JOIN orders o ON o.customer_id = c.id;", note: "Unmatched rows from either side appear with NULLs." },
    ],
    notes: "MySQL has no FULL OUTER JOIN — emulate it with LEFT JOIN UNION RIGHT JOIN.",
    related: ["left-join", "right-join", "union"],
  },
  {
    slug: "self-join", name: "SELF JOIN", category: "Joins",
    summary: "Join a table to itself, using two aliases, to compare rows within one table.",
    syntax: "SELECT ... FROM t a JOIN t b ON a.col = b.col;",
    examples: [
      { code: "SELECT a.name, b.name\nFROM customers a JOIN customers b\n  ON a.city = b.city AND a.id < b.id;", note: "Pairs of customers who live in the same city." },
    ],
    related: ["inner-join", "cross-join"],
  },
  {
    slug: "cross-join", name: "CROSS JOIN", category: "Joins",
    summary: "Return every combination of rows from both tables (the Cartesian product).",
    syntax: "SELECT ... FROM a CROSS JOIN b;",
    examples: [
      { code: "SELECT c.name, r.name\nFROM customers c CROSS JOIN restaurants r;", note: "Every customer paired with every restaurant. Grows fast — use with care." },
    ],
    related: ["inner-join", "self-join"],
  },

  // ---------- Set operations ----------
  {
    slug: "union", name: "UNION / UNION ALL", category: "Set operations",
    summary: "Stack the rows of two results into one list. UNION removes duplicates; UNION ALL keeps them.",
    syntax: "SELECT ... UNION [ALL] SELECT ...;",
    examples: [
      { code: "SELECT city FROM customers\nUNION\nSELECT city FROM restaurants;", note: "All cities from both tables, duplicates removed." },
    ],
    notes: "Both SELECTs must return the same number and types of columns. UNION ALL is faster.",
    related: ["intersect", "except"],
  },
  {
    slug: "intersect", name: "INTERSECT", category: "Set operations",
    summary: "Return only rows that appear in both result sets.",
    syntax: "SELECT ... INTERSECT SELECT ...;",
    examples: [
      { code: "SELECT city FROM customers\nINTERSECT\nSELECT city FROM restaurants;", note: "Cities that have both a customer and a restaurant." },
    ],
    notes: "Supported by SQLite, PostgreSQL, SQL Server; MySQL added it in 8.0.31.",
    related: ["union", "except"],
  },
  {
    slug: "except", name: "EXCEPT (MINUS)", category: "Set operations",
    summary: "Return rows in the first result that are not in the second.",
    syntax: "SELECT ... EXCEPT SELECT ...;",
    examples: [
      { code: "SELECT city FROM customers\nEXCEPT\nSELECT city FROM restaurants;", note: "Cities with customers but no restaurant." },
    ],
    notes: "Oracle calls this MINUS.",
    related: ["union", "intersect"],
  },

  // ---------- Constraints ----------
  {
    slug: "primary-key", name: "PRIMARY KEY", category: "Constraints",
    summary: "Uniquely identifies each row. Must be unique and not NULL; one per table.",
    syntax: "CREATE TABLE t (id INTEGER PRIMARY KEY, ...);",
    examples: [
      { code: "CREATE TABLE customers (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);", note: "id is guaranteed unique and never NULL." },
    ],
    related: ["foreign-key", "unique", "not-null"],
  },
  {
    slug: "foreign-key", name: "FOREIGN KEY", category: "Constraints",
    summary: "A column that points to a primary key in another table, enforcing valid references.",
    syntax: "FOREIGN KEY (col) REFERENCES other(id) ON DELETE CASCADE;",
    examples: [
      { code: "CREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  FOREIGN KEY (customer_id) REFERENCES customers(id)\n);", note: "Every customer_id must exist in customers." },
    ],
    notes: "ON DELETE CASCADE deletes child rows when the parent is deleted. SQLite needs PRAGMA foreign_keys = ON.",
    related: ["primary-key"],
  },
  {
    slug: "unique", name: "UNIQUE", category: "Constraints",
    summary: "Ensures all values in a column (or set of columns) are different.",
    syntax: "CREATE TABLE t (email TEXT UNIQUE, ...);",
    examples: [
      { code: "CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  email TEXT UNIQUE\n);", note: "No two users can share an email. Unlike PRIMARY KEY, UNIQUE allows NULLs." },
    ],
    related: ["primary-key", "not-null"],
  },
  {
    slug: "not-null", name: "NOT NULL", category: "Constraints",
    summary: "Requires a column to always have a value.",
    syntax: "CREATE TABLE t (name TEXT NOT NULL, ...);",
    examples: [
      { code: "CREATE TABLE customers (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);", note: "Inserting a row without a name fails." },
    ],
    related: ["default", "unique"],
  },
  {
    slug: "check", name: "CHECK", category: "Constraints",
    summary: "Rejects any row where a condition is false.",
    syntax: "CREATE TABLE t (col INTEGER CHECK (condition));",
    examples: [
      { code: "CREATE TABLE restaurants (\n  id INTEGER PRIMARY KEY,\n  rating REAL CHECK (rating >= 0 AND rating <= 5)\n);", note: "A rating outside 0–5 is refused." },
    ],
    related: ["not-null", "default"],
  },
  {
    slug: "default", name: "DEFAULT", category: "Constraints",
    summary: "Supplies a value automatically when none is given on insert.",
    syntax: "CREATE TABLE t (col TYPE DEFAULT value);",
    examples: [
      { code: "CREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  status TEXT DEFAULT 'placed'\n);", note: "New orders get status 'placed' unless you specify another." },
    ],
    related: ["not-null", "check"],
  },
  // ---------- Functions ----------
  {
    slug: "aggregate-functions", name: "Aggregate functions", category: "Functions",
    summary: "Summarise a whole column into one value: COUNT, SUM, AVG, MIN, MAX.",
    syntax: "SELECT COUNT(*), SUM(col), AVG(col), MIN(col), MAX(col) FROM table_name;",
    examples: [
      { code: "SELECT COUNT(*) AS orders, SUM(amount) AS total, ROUND(AVG(amount), 2) AS avg\nFROM orders;", note: "One summary row for the whole table." },
      { code: "SELECT city, COUNT(*) FROM customers GROUP BY city;", note: "With GROUP BY, you get one summary per group." },
    ],
    notes: "COUNT(*) counts rows; COUNT(col) counts non-NULL values; COUNT(DISTINCT col) counts unique values.",
    related: ["group-by", "having"],
  },
  {
    slug: "string-functions", name: "String functions", category: "Functions",
    summary: "Transform text: UPPER, LOWER, LENGTH, SUBSTR, TRIM, REPLACE, and || to join.",
    syntax: "SELECT UPPER(col), LENGTH(col), SUBSTR(col, 1, 3) FROM table_name;",
    examples: [
      { code: "SELECT UPPER(name), LENGTH(name) FROM customers;", note: "Upper-case the name and count its characters." },
      { code: "SELECT name || ' from ' || city AS label FROM customers;", note: "|| joins strings in SQLite/PostgreSQL. MySQL uses CONCAT(name, ' from ', city)." },
    ],
    notes: "Function names vary by database (e.g. SUBSTRING vs SUBSTR). SQLite string positions start at 1.",
    related: ["numeric-functions", "date-functions"],
  },
  {
    slug: "numeric-functions", name: "Numeric functions", category: "Functions",
    summary: "Work with numbers: ROUND, ABS, and the % (modulo) operator.",
    syntax: "SELECT ROUND(col, 2), ABS(col), col % 2 FROM table_name;",
    examples: [
      { code: "SELECT name, ROUND(rating, 1) FROM restaurants;", note: "Round the rating to 1 decimal place." },
      { code: "SELECT cost_for_two % 100 AS remainder FROM restaurants;", note: "% gives the remainder after division." },
    ],
    related: ["string-functions", "cast"],
  },
  {
    slug: "date-functions", name: "Date & time functions", category: "Functions",
    summary: "Read and format dates. SQLite uses DATE() and strftime().",
    syntax: "SELECT DATE('now'), strftime('%Y', date_column) FROM table_name;",
    examples: [
      { code: "SELECT strftime('%Y', order_date) AS year FROM orders;", note: "Pull the year out of a date." },
      { code: "SELECT DATE('now');", note: "Today's date." },
    ],
    notes: "Date functions differ a lot between databases: MySQL uses YEAR()/NOW()/DATE_ADD(); PostgreSQL uses EXTRACT()/NOW().",
    related: ["string-functions", "numeric-functions"],
  },
  {
    slug: "coalesce", name: "COALESCE & NULLIF", category: "Functions",
    summary: "Handle NULLs: COALESCE returns the first non-NULL; NULLIF returns NULL when two values are equal.",
    syntax: "SELECT COALESCE(col, fallback), NULLIF(a, b) FROM table_name;",
    examples: [
      { code: "SELECT id, COALESCE(rating_given, 0) AS rating FROM orders;", note: "Show 0 instead of NULL for unrated orders." },
      { code: "SELECT NULLIF(city, '') FROM customers;", note: "Turn an empty string into NULL." },
    ],
    notes: "MySQL/Oracle also have IFNULL/NVL for the single-fallback case.",
    related: ["is-null", "case", "cast"],
  },
  {
    slug: "case", name: "CASE", category: "Functions",
    summary: "If-then-else inside a query: return a different value per row based on conditions.",
    syntax: "CASE WHEN condition THEN result [WHEN ...] ELSE result END",
    examples: [
      { code: "SELECT name,\n  CASE WHEN rating >= 4.5 THEN 'top'\n       WHEN rating >= 4.0 THEN 'good'\n       ELSE 'ok' END AS tier\nFROM restaurants;", note: "Label each restaurant by its rating." },
    ],
    related: ["coalesce", "where"],
  },
  {
    slug: "cast", name: "CAST", category: "Functions",
    summary: "Convert a value from one data type to another.",
    syntax: "SELECT CAST(expression AS type) FROM table_name;",
    examples: [
      { code: "SELECT CAST(rating AS INTEGER) FROM restaurants;", note: "Drop the decimal part by converting REAL to INTEGER." },
    ],
    related: ["numeric-functions", "coalesce"],
  },

  // ---------- Advanced ----------
  {
    slug: "subquery", name: "Subquery", category: "Advanced",
    summary: "A query nested inside another query — used in WHERE, FROM or SELECT.",
    syntax: "SELECT ... WHERE col OP (SELECT ... FROM ...);",
    examples: [
      { code: "SELECT name FROM restaurants\nWHERE rating > (SELECT AVG(rating) FROM restaurants);", note: "Restaurants rated above the overall average. The inner query runs first." },
    ],
    notes: "A correlated subquery refers to the outer query and runs once per row — powerful but can be slow.",
    related: ["exists", "cte", "in"],
  },
  {
    slug: "cte", name: "CTE (WITH)", category: "Advanced",
    summary: "Name a query up front with WITH so the main query reads cleanly. Add RECURSIVE for hierarchies.",
    syntax: "WITH name AS (SELECT ...) SELECT ... FROM name;",
    examples: [
      { code: "WITH spend AS (\n  SELECT customer_id, SUM(amount) AS total\n  FROM orders GROUP BY customer_id\n)\nSELECT * FROM spend WHERE total > 1000;", note: "The named result 'spend' is used like a table below." },
    ],
    related: ["subquery", "window-functions"],
  },
  {
    slug: "window-functions", name: "Window functions", category: "Advanced",
    summary: "Add a per-row calculation (rank, running total) across a set of rows, without collapsing them.",
    syntax: "SELECT ..., FUNC() OVER (PARTITION BY col ORDER BY col) FROM table_name;",
    examples: [
      { code: "SELECT name, city, rating,\n  RANK() OVER (PARTITION BY city ORDER BY rating DESC) AS rank_in_city\nFROM restaurants;", note: "Rank restaurants within each city. ROW_NUMBER, DENSE_RANK, LAG and LEAD also work with OVER." },
    ],
    notes: "Unlike GROUP BY, window functions keep every row in the output.",
    related: ["cte", "aggregate-functions", "order-by"],
  },

  // ---------- Advanced (transactions & server-side) ----------
  {
    slug: "transactions", name: "Transactions (BEGIN/COMMIT/ROLLBACK)", category: "Advanced",
    summary: "Group several statements so they all succeed together, or all undo together.",
    syntax: "BEGIN;\n  ...statements...\nCOMMIT;   -- or ROLLBACK;",
    examples: [
      { code: "BEGIN;\nUPDATE accounts SET balance = balance - 200 WHERE id = 2;\nUPDATE accounts SET balance = balance + 200 WHERE id = 1;\nCOMMIT;", note: "A money transfer: both updates commit together, or ROLLBACK undoes both." },
    ],
    notes: "Transactions provide the ACID guarantees that make databases reliable.",
    related: ["acid"],
  },
  {
    slug: "triggers", name: "Triggers", category: "Advanced",
    summary: "A stored action the database runs automatically before or after an INSERT, UPDATE or DELETE.",
    syntax: "CREATE TRIGGER name AFTER INSERT ON table\nBEGIN\n  ...statements...\nEND;",
    examples: [
      { code: "CREATE TRIGGER log_new_order AFTER INSERT ON orders\nBEGIN\n  INSERT INTO audit (msg) VALUES ('order added');\nEND;", note: "Automatically log every new order." },
    ],
    notes: "SQLite supports basic triggers. Use them sparingly — they hide logic that runs 'invisibly'.",
    related: ["stored-procedures"],
  },
  {
    slug: "stored-procedures", name: "Stored procedures", category: "Advanced",
    summary: "A named block of SQL saved in the database and run by calling its name.",
    syntax: "CREATE PROCEDURE name() BEGIN ...; END;\nCALL name();",
    examples: [
      { code: "-- MySQL example\nCREATE PROCEDURE top_rated()\nBEGIN\n  SELECT * FROM restaurants ORDER BY rating DESC LIMIT 5;\nEND;", note: "Reuse a query by calling top_rated()." },
    ],
    notes: "Not available in SQLite, so this cannot run in SQLingo. MySQL, PostgreSQL and SQL Server support stored procedures.",
    related: ["triggers", "cursors"],
  },
  {
    slug: "cursors", name: "Cursors", category: "Advanced",
    summary: "A way to step through query results one row at a time inside procedural SQL.",
    syntax: "DECLARE cur CURSOR FOR SELECT ...;\nOPEN cur; FETCH cur INTO ...; CLOSE cur;",
    examples: [
      { code: "-- inside a stored procedure\nDECLARE cur CURSOR FOR SELECT id FROM orders;", note: "Process orders one by one." },
    ],
    notes: "Not in SQLite. Prefer set-based SQL (a single query) over cursors where possible — cursors are much slower.",
    related: ["stored-procedures"],
  },

  // ---------- Data definition (DDL) ----------
  {
    slug: "create-table", name: "CREATE TABLE", category: "Data definition",
    summary: "Create a new table by naming its columns and their types.",
    syntax: "CREATE TABLE name (\n  col1 TYPE constraints,\n  col2 TYPE\n);",
    examples: [
      { code: "CREATE TABLE customers (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  city TEXT\n);", note: "The common SQLite types are INTEGER, REAL, TEXT and BLOB." },
    ],
    related: ["alter-table", "drop-table", "primary-key"],
  },
  {
    slug: "alter-table", name: "ALTER TABLE", category: "Data definition",
    summary: "Change an existing table — add, rename or drop a column, or rename the table.",
    syntax: "ALTER TABLE name ADD COLUMN col TYPE;",
    examples: [
      { code: "ALTER TABLE restaurants ADD COLUMN active INTEGER DEFAULT 1;", note: "Add a new column with a default value." },
    ],
    notes: "SQLite allows limited ALTER (add/rename/drop column, rename table); other databases allow more.",
    related: ["create-table", "drop-table"],
  },
  {
    slug: "drop-table", name: "DROP TABLE", category: "Data definition",
    summary: "Remove a table and all of its data permanently.",
    syntax: "DROP TABLE [IF EXISTS] name;",
    examples: [
      { code: "DROP TABLE IF EXISTS temp_data;", note: "IF EXISTS avoids an error when the table is not there." },
    ],
    related: ["create-table", "truncate"],
  },
  {
    slug: "create-index", name: "CREATE INDEX", category: "Data definition",
    summary: "Create an index to make lookups on a column much faster.",
    syntax: "CREATE INDEX idx_name ON table (column);",
    examples: [
      { code: "CREATE INDEX idx_orders_customer ON orders (customer_id);", note: "Speeds up filters and joins on customer_id." },
    ],
    notes: "Indexes speed up reads but slightly slow writes and use extra space. CREATE UNIQUE INDEX also enforces uniqueness.",
    related: ["create-view", "primary-key"],
  },
  {
    slug: "create-view", name: "CREATE VIEW", category: "Data definition",
    summary: "Save a query under a name and reuse it like a table.",
    syntax: "CREATE VIEW name AS SELECT ...;",
    examples: [
      { code: "CREATE VIEW mumbai_restaurants AS\n  SELECT name, rating FROM restaurants WHERE city = 'Mumbai';", note: "Query the view like a table; the stored SELECT runs underneath." },
    ],
    notes: "A view stores the query, not data. Materialized views (which store results) are not available in SQLite.",
    related: ["create-index", "subquery"],
  },

  // ---------- Data modification (DML) ----------
  {
    slug: "insert", name: "INSERT", category: "Data modification",
    summary: "Add one or more new rows to a table.",
    syntax: "INSERT INTO table (col1, col2) VALUES (v1, v2);",
    examples: [
      { code: "INSERT INTO customers (name, city) VALUES ('Meera', 'Pune');", note: "Add one customer." },
      { code: "INSERT INTO customers (name, city) VALUES\n  ('Rahul', 'Delhi'),\n  ('Sana', 'Mumbai');", note: "Insert several rows at once." },
    ],
    related: ["update", "delete", "upsert"],
  },
  {
    slug: "update", name: "UPDATE", category: "Data modification",
    summary: "Change values in existing rows.",
    syntax: "UPDATE table SET col = value WHERE condition;",
    examples: [
      { code: "UPDATE restaurants SET rating = 4.9 WHERE id = 1;", note: "Change one row." },
    ],
    notes: "Always include WHERE — an UPDATE without it changes every row.",
    related: ["insert", "delete"],
  },
  {
    slug: "delete", name: "DELETE", category: "Data modification",
    summary: "Remove rows from a table.",
    syntax: "DELETE FROM table WHERE condition;",
    examples: [
      { code: "DELETE FROM orders WHERE amount < 100;", note: "Remove small orders." },
    ],
    notes: "A DELETE without WHERE removes every row. To empty a table fast, use TRUNCATE where it is supported.",
    related: ["truncate", "update"],
  },
  {
    slug: "upsert", name: "UPSERT (INSERT ... ON CONFLICT)", category: "Data modification",
    summary: "Insert a row, or update it if it already exists.",
    syntax: "INSERT INTO t (...) VALUES (...)\nON CONFLICT(key) DO UPDATE SET ...;",
    examples: [
      { code: "INSERT INTO customers (id, name) VALUES (1, 'Aarav')\nON CONFLICT(id) DO UPDATE SET name = excluded.name;", note: "Add customer 1, or update the name if id 1 exists." },
    ],
    notes: "SQLite and PostgreSQL use ON CONFLICT; SQL Server and the SQL standard use MERGE.",
    related: ["insert", "update"],
  },
  {
    slug: "truncate", name: "TRUNCATE", category: "Data modification",
    summary: "Empty a table quickly, removing all rows.",
    syntax: "TRUNCATE TABLE name;",
    examples: [
      { code: "TRUNCATE TABLE orders;", note: "Removes every row, faster than DELETE for a full wipe." },
    ],
    notes: "SQLite has no TRUNCATE — use DELETE FROM table instead.",
    related: ["delete", "drop-table"],
  },

  // ---------- Theory ----------
  {
    slug: "keys", name: "Keys", category: "Theory",
    summary: "The columns that identify rows and link tables together.",
    detail: [
      "A primary key uniquely identifies each row (unique and never NULL). A foreign key stores another table's primary key to link records, so orders can point at the customer they belong to.",
      "A candidate key is any column (or set of columns) that could serve as the primary key; you pick one, and the rest stay candidate keys. A super key is any set of columns that is unique (a candidate key plus extra columns). A composite key is a key made of more than one column.",
      "A surrogate key is a system-generated id (like an auto-increment number or UUID); a natural key is real-world data (like an email). Most tables use a surrogate key because it never has to change.",
    ],
    related: ["primary-key", "foreign-key", "normalization"],
  },
  {
    slug: "normalization", name: "Normalization (1NF–BCNF)", category: "Theory",
    summary: "Organising columns into tables so each fact is stored once, avoiding duplication.",
    detail: [
      "1NF (First Normal Form): every column holds a single, atomic value — no lists or repeating groups in one cell.",
      "2NF: the table is in 1NF and every non-key column depends on the whole primary key, not just part of a composite key.",
      "3NF: the table is in 2NF and no non-key column depends on another non-key column (no transitive dependencies).",
      "BCNF (Boyce-Codd) is a stricter 3NF that handles a few edge cases with overlapping candidate keys. In practice, aiming for 3NF is usually enough; you sometimes denormalize on purpose to speed up reads.",
    ],
    related: ["keys", "dbms-vs-rdbms"],
  },
  {
    slug: "acid", name: "ACID", category: "Theory",
    summary: "The four guarantees that make a transaction reliable.",
    detail: [
      "Atomicity: all steps in a transaction succeed, or none do — never half.",
      "Consistency: a transaction moves the database from one valid state to another, respecting all rules and constraints.",
      "Isolation: concurrent transactions don't corrupt each other; each behaves as if it ran alone.",
      "Durability: once a transaction is committed, its changes survive even a crash or power loss.",
    ],
    related: ["transactions"],
  },
  {
    slug: "dbms-vs-rdbms", name: "DBMS vs RDBMS", category: "Theory",
    summary: "A DBMS manages data; an RDBMS is a DBMS that stores it in related tables.",
    detail: [
      "A DBMS (Database Management System) is any software that stores and manages data. An RDBMS (Relational DBMS) is the kind that stores data in tables of rows and columns, with relationships between tables enforced by keys — and you query it with SQL.",
      "MySQL, PostgreSQL, SQLite, SQL Server and Oracle are all relational (RDBMS). NoSQL systems are non-relational DBMSs.",
    ],
    related: ["keys", "command-families"],
  },
  {
    slug: "command-families", name: "DDL, DML, DCL, TCL", category: "Theory",
    summary: "SQL statements grouped by what they do.",
    detail: [
      "DDL (Data Definition Language) — defines structure: CREATE, ALTER, DROP, TRUNCATE.",
      "DML (Data Manipulation Language) — changes data: INSERT, UPDATE, DELETE.",
      "DQL (Data Query Language) — reads data: SELECT.",
      "DCL (Data Control Language) — permissions: GRANT, REVOKE.",
      "TCL (Transaction Control Language) — transactions: BEGIN, COMMIT, ROLLBACK, SAVEPOINT.",
    ],
    notes: "You will see these acronyms in documentation and interviews.",
    related: ["create-table", "insert", "transactions"],
  },
  // ---------- Functions: individual reference pages ----------
  {
    slug: "count", name: "COUNT()", category: "Functions",
    summary: "Count rows, or non-NULL values in a column.",
    syntax: "SELECT COUNT(*) FROM table_name;   -- or COUNT(column), COUNT(DISTINCT column)",
    examples: [
      { code: "SELECT COUNT(*) FROM customers;", note: "Total number of customers." },
      { code: "SELECT COUNT(DISTINCT city) FROM customers;", note: "How many different cities." },
    ],
    notes: "COUNT(*) counts every row; COUNT(column) skips NULLs in that column.",
    related: ["aggregate-functions", "sum", "group-by"],
  },
  {
    slug: "sum", name: "SUM()", category: "Functions",
    summary: "Add up all the values in a numeric column.",
    syntax: "SELECT SUM(column) FROM table_name;",
    examples: [{ code: "SELECT SUM(amount) FROM orders;", note: "Total value of all orders." }],
    notes: "SUM ignores NULLs. On an empty set it returns NULL, not 0.",
    related: ["aggregate-functions", "avg", "count"],
  },
  {
    slug: "avg", name: "AVG()", category: "Functions",
    summary: "Return the average (mean) of a numeric column.",
    syntax: "SELECT AVG(column) FROM table_name;",
    examples: [{ code: "SELECT ROUND(AVG(rating), 2) FROM restaurants;", note: "Average rating, rounded to 2 decimals." }],
    notes: "AVG ignores NULLs, so the average is over the rows that actually have a value.",
    related: ["aggregate-functions", "sum", "round"],
  },
  {
    slug: "min", name: "MIN()", category: "Functions",
    summary: "Return the smallest value in a column.",
    syntax: "SELECT MIN(column) FROM table_name;",
    examples: [{ code: "SELECT MIN(cost_for_two) FROM restaurants;", note: "The cheapest cost for two." }],
    related: ["aggregate-functions", "max"],
  },
  {
    slug: "max", name: "MAX()", category: "Functions",
    summary: "Return the largest value in a column.",
    syntax: "SELECT MAX(column) FROM table_name;",
    examples: [{ code: "SELECT MAX(rating) FROM restaurants;", note: "The highest rating." }],
    related: ["aggregate-functions", "min"],
  },
  {
    slug: "upper", name: "UPPER()", category: "Functions",
    summary: "Convert text to upper case.",
    syntax: "SELECT UPPER(column) FROM table_name;",
    examples: [{ code: "SELECT UPPER(name) FROM customers;", note: "Names in capitals." }],
    related: ["lower", "string-functions"],
  },
  {
    slug: "lower", name: "LOWER()", category: "Functions",
    summary: "Convert text to lower case.",
    syntax: "SELECT LOWER(column) FROM table_name;",
    examples: [{ code: "SELECT LOWER(city) FROM customers;", note: "Cities in lower case." }],
    related: ["upper", "string-functions"],
  },
  {
    slug: "length", name: "LENGTH()", category: "Functions",
    summary: "Count the number of characters in text.",
    syntax: "SELECT LENGTH(column) FROM table_name;",
    examples: [{ code: "SELECT name, LENGTH(name) FROM customers;", note: "How many characters each name has." }],
    notes: "MySQL uses CHAR_LENGTH() for characters; LENGTH() there counts bytes.",
    related: ["substr", "string-functions"],
  },
  {
    slug: "substr", name: "SUBSTR()", category: "Functions",
    summary: "Pull out part of a string, by start position and length.",
    syntax: "SELECT SUBSTR(column, start, length) FROM table_name;",
    examples: [{ code: "SELECT SUBSTR(name, 1, 3) FROM customers;", note: "First three characters. Positions start at 1." }],
    notes: "Also written SUBSTRING() in some databases.",
    related: ["length", "replace", "string-functions"],
  },
  {
    slug: "trim", name: "TRIM()", category: "Functions",
    summary: "Remove leading and trailing spaces (or other characters) from text.",
    syntax: "SELECT TRIM(column) FROM table_name;",
    examples: [{ code: "SELECT TRIM('   hello   ');", note: "Returns 'hello'. LTRIM and RTRIM trim one side only." }],
    related: ["replace", "string-functions"],
  },
  {
    slug: "replace", name: "REPLACE()", category: "Functions",
    summary: "Swap every occurrence of one substring for another.",
    syntax: "SELECT REPLACE(column, 'find', 'replace_with') FROM table_name;",
    examples: [{ code: "SELECT REPLACE(city, 'Mumbai', 'Bombay') FROM customers;", note: "Show Mumbai as Bombay in the result (the table is unchanged)." }],
    related: ["substr", "string-functions"],
  },
  {
    slug: "concat", name: "|| (concatenate)", category: "Functions",
    summary: "Join two or more strings together.",
    syntax: "SELECT a || b || c FROM table_name;",
    examples: [{ code: "SELECT name || ' from ' || city AS label FROM customers;", note: "Build one string from several columns." }],
    notes: "|| works in SQLite/PostgreSQL/Oracle. MySQL uses CONCAT(a, b, c).",
    related: ["string-functions", "upper"],
  },
  {
    slug: "round", name: "ROUND()", category: "Functions",
    summary: "Round a number to a given number of decimal places.",
    syntax: "SELECT ROUND(column, decimals) FROM table_name;",
    examples: [{ code: "SELECT ROUND(rating, 1) FROM restaurants;", note: "Rating to one decimal place." }],
    related: ["abs", "cast", "numeric-functions"],
  },
  {
    slug: "abs", name: "ABS()", category: "Functions",
    summary: "Return the absolute (non-negative) value of a number.",
    syntax: "SELECT ABS(expression);",
    examples: [{ code: "SELECT ABS(-5);", note: "Returns 5." }],
    related: ["round", "modulo", "numeric-functions"],
  },
  {
    slug: "modulo", name: "% (modulo)", category: "Functions",
    summary: "Return the remainder after dividing one number by another.",
    syntax: "SELECT a % b;",
    examples: [{ code: "SELECT 17 % 5;", note: "Returns 2. Useful for 'every Nth row' or even/odd checks." }],
    notes: "% is an operator, not a function. Some databases use the MOD(a, b) function instead.",
    related: ["round", "numeric-functions"],
  },
  {
    slug: "strftime", name: "strftime()", category: "Functions",
    summary: "Format a date/time value into text using format codes (SQLite).",
    syntax: "SELECT strftime('%Y-%m-%d', date_column) FROM table_name;",
    examples: [
      { code: "SELECT strftime('%Y', order_date) FROM orders;", note: "Pull the year out of a date." },
      { code: "SELECT strftime('%Y-%m', order_date) FROM orders;", note: "Year and month, e.g. 2024-06." },
    ],
    notes: "This is SQLite-specific. MySQL uses DATE_FORMAT(); PostgreSQL uses TO_CHAR().",
    related: ["date-fn", "datetime", "date-functions"],
  },
  {
    slug: "date-fn", name: "DATE()", category: "Functions",
    summary: "Return or compute a date value (SQLite).",
    syntax: "SELECT DATE('now');   -- or DATE(column, modifier)",
    examples: [
      { code: "SELECT DATE('now');", note: "Today's date." },
      { code: "SELECT DATE('now', '-7 days');", note: "The date one week ago." },
    ],
    related: ["strftime", "datetime", "date-functions"],
  },
  {
    slug: "datetime", name: "DATETIME()", category: "Functions",
    summary: "Return or compute a date-and-time value (SQLite).",
    syntax: "SELECT DATETIME('now');",
    examples: [{ code: "SELECT DATETIME('now', 'localtime');", note: "Current date and time in local time." }],
    related: ["date-fn", "strftime", "date-functions"],
  },
  {
    slug: "ifnull", name: "IFNULL()", category: "Functions",
    summary: "Return a fallback value when the first argument is NULL.",
    syntax: "SELECT IFNULL(column, fallback) FROM table_name;",
    examples: [{ code: "SELECT IFNULL(rating_given, 0) FROM orders;", note: "Show 0 instead of NULL for unrated orders." }],
    notes: "IFNULL is a two-argument shortcut; COALESCE does the same and takes any number of arguments. Oracle uses NVL().",
    related: ["coalesce", "nullif", "is-null"],
  },
  {
    slug: "nullif", name: "NULLIF()", category: "Functions",
    summary: "Return NULL when the two arguments are equal, otherwise the first.",
    syntax: "SELECT NULLIF(a, b) FROM table_name;",
    examples: [{ code: "SELECT NULLIF(city, '') FROM customers;", note: "Turn an empty string into a real NULL." }],
    related: ["coalesce", "ifnull"],
  },
  {
    slug: "typeof", name: "typeof()", category: "Functions",
    summary: "Return the storage type of a value: integer, real, text, blob or null (SQLite).",
    syntax: "SELECT typeof(column) FROM table_name;",
    examples: [{ code: "SELECT typeof(rating) FROM restaurants;", note: "Returns 'real' for the decimal rating." }],
    notes: "SQLite-specific, handy for debugging unexpected types.",
    related: ["cast", "numeric-functions"],
  },
  // ---------- Dialects & differences ----------
  {
    slug: "sql-dialects", name: "SQL dialects", category: "Dialects & differences",
    summary: "SQL is a standard, but each database has small differences called dialects.",
    detail: [
      "The core SQL you learn here — SELECT, WHERE, JOIN, GROUP BY — works almost the same in every database. The differences are at the edges.",
      "The common databases are SQLite, MySQL, PostgreSQL, SQL Server (Microsoft) and Oracle. They differ mostly in how you limit rows, join strings, auto-number a key, and format dates. The pages below show those differences side by side.",
    ],
    related: ["limit-vs-top", "concat-across-dbs", "auto-increment", "date-across-dbs"],
  },
  {
    slug: "limit-vs-top", name: "LIMIT vs TOP vs FETCH", category: "Dialects & differences",
    summary: "Returning only the first few rows uses different keywords in different databases.",
    detail: ["SQLite, MySQL and PostgreSQL use LIMIT. SQL Server uses TOP. The SQL standard (SQL Server 2012+, Oracle 12c+, PostgreSQL) also supports OFFSET ... FETCH."],
    examples: [
      { code: "-- SQLite, MySQL, PostgreSQL\nSELECT * FROM restaurants ORDER BY rating DESC LIMIT 3;", note: "" },
      { code: "-- SQL Server\nSELECT TOP 3 * FROM restaurants ORDER BY rating DESC;", note: "" },
      { code: "-- Standard (SQL Server, Oracle, PostgreSQL)\nSELECT * FROM restaurants ORDER BY rating DESC\nOFFSET 0 ROWS FETCH NEXT 3 ROWS ONLY;", note: "" },
    ],
    related: ["limit", "sql-dialects"],
  },
  {
    slug: "concat-across-dbs", name: "String joining across databases", category: "Dialects & differences",
    summary: "Joining strings together is written differently in each database.",
    detail: ["SQLite, PostgreSQL and Oracle use the || operator. MySQL uses the CONCAT() function (by default || means OR in MySQL). SQL Server uses + or CONCAT()."],
    examples: [
      { code: "-- SQLite, PostgreSQL, Oracle\nSELECT name || ' - ' || city FROM customers;", note: "" },
      { code: "-- MySQL, SQL Server\nSELECT CONCAT(name, ' - ', city) FROM customers;", note: "" },
    ],
    related: ["concat", "sql-dialects"],
  },
  {
    slug: "auto-increment", name: "Auto-increment keys across databases", category: "Dialects & differences",
    summary: "Auto-numbering a primary key has a different keyword in each database.",
    detail: ["SQLite: an INTEGER PRIMARY KEY auto-increments on its own (add AUTOINCREMENT to stop ids being reused). MySQL: AUTO_INCREMENT. PostgreSQL: SERIAL, or GENERATED AS IDENTITY. SQL Server: IDENTITY(1,1)."],
    examples: [
      { code: "-- SQLite\nCREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT);", note: "" },
      { code: "-- MySQL\nCREATE TABLE t (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50));", note: "" },
      { code: "-- PostgreSQL\nCREATE TABLE t (id SERIAL PRIMARY KEY, name TEXT);", note: "" },
    ],
    related: ["primary-key", "sql-dialects"],
  },
  {
    slug: "date-across-dbs", name: "Date functions across databases", category: "Dialects & differences",
    summary: "Getting today's date and formatting dates differs by database.",
    detail: ["Current date/time: SQLite uses DATE('now') and DATETIME('now'); MySQL uses NOW() and CURDATE(); PostgreSQL uses NOW() and CURRENT_DATE. Formatting: SQLite uses strftime(); MySQL uses DATE_FORMAT(); PostgreSQL uses TO_CHAR()."],
    examples: [
      { code: "-- SQLite\nSELECT strftime('%Y', order_date) FROM orders;", note: "" },
      { code: "-- MySQL\nSELECT YEAR(order_date) FROM orders;", note: "" },
      { code: "-- PostgreSQL\nSELECT EXTRACT(YEAR FROM order_date) FROM orders;", note: "" },
    ],
    related: ["strftime", "date-functions", "sql-dialects"],
  },
  {
    slug: "identifier-quoting", name: "Quoting table and column names", category: "Dialects & differences",
    summary: "How you quote a name that has a space or is a reserved word differs by database.",
    detail: [
      "SQLite and PostgreSQL (and standard SQL) use double quotes: \"order\". MySQL uses backticks: `order`. SQL Server uses square brackets: [order].",
      "Single quotes are always for text values, never for table or column names — mixing them up is a common beginner error.",
    ],
    related: ["sql-dialects"],
  },

  // ---------- Theory (added) ----------
  {
    slug: "relational-algebra", name: "Relational algebra", category: "Theory",
    summary: "The small set of operations that SQL is built on.",
    detail: [
      "Relational algebra is the theory underneath SQL. Its main operations map directly to SQL you already use: selection picks rows (WHERE), projection picks columns (the SELECT list), join combines tables, and union / intersect / except combine result sets.",
      "You never write relational algebra directly, but it explains why the SQL pieces fit together the way they do.",
    ],
    related: ["select", "where", "inner-join"],
  },
  {
    slug: "er-model", name: "ER model", category: "Theory",
    summary: "A diagram of the things a system stores and how they relate, used to design tables.",
    detail: [
      "An Entity-Relationship (ER) model shows the entities a system stores (like customer and order) and the relationships between them (a customer places many orders).",
      "Each entity becomes a table, and each relationship becomes a foreign key. You draw the ER model first, then turn it into CREATE TABLE statements.",
    ],
    related: ["keys", "foreign-key", "normalization"],
  },
  {
    slug: "index-internals", name: "How an index works (B-tree)", category: "Theory",
    summary: "Why an index makes lookups fast.",
    detail: [
      "Most indexes are a B-tree: a sorted, balanced tree. Because the values are kept in order, the database can find a match in a few steps instead of scanning every row — like finding a word in a dictionary rather than reading every page.",
      "The same order makes range queries (BETWEEN, <, >) and ORDER BY on the indexed column fast. The cost is extra storage and a little work on every write to keep the tree sorted.",
    ],
    related: ["create-index", "primary-key"],
  },
  {
    slug: "query-optimization", name: "Query optimization", category: "Theory",
    summary: "How the database decides how to run your query, and how to help it.",
    detail: [
      "You write what you want; the database's query optimizer decides how to get it — which index to use, which join method, and in what order. It uses statistics about your data to estimate the cheapest plan.",
      "See the chosen plan with EXPLAIN (or EXPLAIN QUERY PLAN in SQLite). To help the optimizer: add indexes on the columns you filter and join on, avoid wrapping an indexed column in a function, and select only the columns you need.",
    ],
    related: ["create-index", "index-internals"],
  },
];

export const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));

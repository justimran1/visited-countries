import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "olubodun112",
  port: 5432,
});
db.connect();
//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let total_visited = 0;
//database query
async function CheckVisited() {
  const visited_countries = await db.query(
    "  SELECT country_code FROM visited_countries"
  );
  console.log(visited_countries.rows);

  let country_codes = [];

  visited_countries.rows.forEach((e) => {
    country_codes.push(e.country_code);
  });
  country_codes.toString;
  console.log(country_codes);
  return country_codes;
}

//Get home page
app.get("/", async (req, res) => {
  const countries = await CheckVisited();
  total_visited = countries.length;
  res.render("index.ejs", {
    total: total_visited,
    countries: countries,
  });
});

//Search for a country
app.post("/add", async (req, res) => {
  const user_country = req.body.country.trim();
  var storedCountries;

  try {
    const result = await db.query(
      "SELECT * FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' ",
      [user_country.toLowerCase()]
    );
    storedCountries = result.rows[0];
    const unique_value = storedCountries.country_code;
    console.log(unique_value);
    try {
      await db.query(
        "INSERT INTO visited_countries(country_code) VALUES ($1)",
        [unique_value]
      );
      res.redirect("/");
    } catch (error) {
      console.log(error);
      const countries = await CheckVisited();
      res.render("index.ejs", {
        error: "Country Already Exist Try again",
        countries: countries,
        total: countries.length,
      });
    }
  } catch (error) {
    console.log(error);
    const countries = await CheckVisited();
    res.render("index.ejs", {
      countries: countries,
      error: "Invalid country name",
      total: countries.length,
    });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

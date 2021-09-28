const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6)
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const randomShortUrl = generateRandomString();
  urlDatabase[randomShortUrl] = req.body.longURL;
  res.redirect(`/urls/${randomShortUrl}`);       // Respond with 'randomshortURL' (we will replace this)
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});


//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = req.params.shortURL;
  console.log(templateVars);
  delete urlDatabase[templateVars];
  console.log('here');
  res.redirect("/urls");

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


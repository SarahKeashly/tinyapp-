const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6)
}

app.set("view engine", "ejs");

//USERS

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "abc"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234"
  }
}

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}


//URL Database of shortURL (key), value is long URL
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Get

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["username_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  console.log("cookies", req.cookies);

  const templateVars = { urls: urlDatabase, user: users[req.cookies["username_id"]] };

  res.render("urls_index", templateVars);

});

//getting the short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["username_id"]] };
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


//Register
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["username_id"]] }

  res.render("register", templateVars)

});


//Login
app.get("/login", (req, res) => {
  console.log("/login.get");
  const templateVars = { user: users[req.cookies["username_id"]] }

  res.render("login", templateVars)

});



///////////////////////// POST

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const randomShortUrl = generateRandomString();
  urlDatabase[randomShortUrl] = req.body.longURL;
  res.redirect(`/urls/${randomShortUrl}`);       // Respond with 'randomshortURL' 
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id; // holds the short id
  const longURL = req.body.longURL
  console.log("SOME", longURL);

  res.redirect("/urls");

});

//REGISTER
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check to see if e-mail or password are blank
  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank");
  }

  //check to see if email exists in the database
  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send('This username is unavailable')
  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password
  }
  console.log("users:", users);

  res.cookie("username_id", id);

  res.redirect("/urls")

});


//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = req.params.shortURL;

  delete urlDatabase[templateVars];

  res.redirect("/urls");

})

//login 

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email);




  // if that user exists with that email
  if (!user) {
    return res.status(403).send('No user with that email was found');
  }

  // does the password provided from the request
  // match the password of the user
  if (user.password !== password) {
    return res.status(403).send('Passwords did not match')
  }
  console.log("user", user.id)
  res.cookie("username_id", user.id);


  res.redirect("/urls");
})


//logout 
app.post("/logout", (req, res) => {
  res.clearCookie("username_id")
  res.redirect("/urls");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


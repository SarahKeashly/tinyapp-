const express = require("express");
const app = express();
const PORT = 8090;
const bcrypt = require('bcryptjs');

const findUserByEmail = require('./helpers')
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cookieSession({
  name: 'cookiemonster',
  keys: ['my secret key', 'yet another secret key']
}));



const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6)
};

app.set("view engine", "ejs");



////USERS 

const hashedPasswordUser1 = bcrypt.hashSync("abc", 10);
const hashedPasswordUser2 = bcrypt.hashSync("1234", 10);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPasswordUser1

  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPasswordUser2
  }
};


////URL DATABASE

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  a3BoGr: {
    longURL: "https://www.yahoo.ca",
    userID: "1234"
  }

};

//create a function
//that returns an object
//with all the urls that belong to a user

const getUrlsForUser = function(id) {
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      results[shortURL] = urlDatabase[shortURL];
    }
  };

  return results;

}

/////////////GET/////////////////////


// New short Url
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];


  // if that user exists with that email
  if (!userId || !user) {
    res.redirect("/login");
    return;
  };


  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// Getting long/short urls
app.get("/urls", (req, res) => {


  const userID = req.session.user_id;
  const user = users[userID]

  if (!userID || !user) {
    return res.status(401).send("You do not have access to this page. Please <a href= '/login'>Login</a>");

  }


  const urls = getUrlsForUser(userID);

  const templateVars = { urls, user };

  res.render("urls_index", templateVars);

});


//getting the short URL
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;


  if (!userID) {
    return res.status(401).send('You do not have access, please login');
  }

  if (userID !== urlDatabase[req.params.id].userID) {
    return res.status(403).send('You do not have access');
  }

  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userID]
  };

  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
})


app.get("/", (req, res) => {
  const userID = req.session.user_id;

  if (!userID || !users[userID]) {
    res.redirect("/login");
    return;
  }

  res.redirect("/urls");

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//Register
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };

  res.render("register", templateVars);

});


//Login
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };

  res.render("login", templateVars);

});



///////////////////////// POST //////////////////////////////


//posting the new shortUrl's ito a page
app.post("/urls", (req, res) => {
  const randomShortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomShortUrl] = { longURL, userID: req.session.user_id };

  res.redirect(`/urls/${randomShortUrl}`);
});

///
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id; // holds the short id
  const longURL = req.body.longURL;
  const userID = req.session.user_id;


  if (!userID) {
    return res.status(401).send('You do not have access, please login');
  }

  if (userID !== urlDatabase[req.params.id].userID) {
    return res.status(403).send('You do not have access');
  }

  urlDatabase[shortURL].longURL = longURL;

  res.redirect("/urls");

});



//REGISTER
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


  //check to see if e-mail or password are blank
  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank <a href= '/register'>Register</a>");
  }

  //check to see if email exists in the database
  // const userId = users['userRandomID'].email || users['user2RandomID'].email;
  const userId = findUserByEmail(email, users);

  // if that user exists with that email
  if (userId) {
    return res.status(401).send("This username is already in use.");
  };

  const hashedPassword = bcrypt.hashSync(password, 10);

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }


  req.session.user_id = id;


  res.redirect("/urls");

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

  const userID = findUserByEmail(email, users);

  // if that user exists with that email
  if (!userID) {

    return res.status(403).send("No user with that email was found.<a href= '/login'>Login</a>");
  }

  const user = users[userID];

  if (!user) {

    return res.status(404).send("No user with that email was found.");
  }

  // does the password provided from the request
  // match the password of the user

  const passwordBcrypt = bcrypt.compareSync(password, user.password);

  if (!passwordBcrypt) {
    return res.status(403).send(`Passwords did not match <a href= '/login'>Login</a>`)
  }

  req.session.user_id = user.id;

  res.redirect("/urls");
})


//logout 
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


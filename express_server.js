const express = require("express");
const app = express();
const PORT = 8090; // default port 8080
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cookieSession({
  name: 'cookiemonster',
  keys: ['my secret key', 'yet another secret key']
}));



const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6)
}

app.set("view engine", "ejs");



//USERS  - current string that is the username key - req.cookies["username_id"

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
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };


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
  // console.log(`this is the keys ${keys}`);
  // console.log("urldatabase", urlDatabase);
  // console.log("id", id);
  for (let shortURL in urlDatabase) {
    // console.log(`this is the shortURL ${shortURL}`);
    // const url = urlDatabase[keys]["longURL"];
    // console.log(`this is the url ${url}`);

    if (urlDatabase[shortURL].userID === id) {
      results[shortURL] = urlDatabase[shortURL];
    }
  }

  return results;

}

//Get

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id; //a way to test if there is a username at req.cookies


  // if that user exists with that email
  if (!userId) {
    return res.status(401).send('You do not have access to this page');
  };


  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});



app.get("/urls", (req, res) => {
  // console.log("cookies", req.cookies["username_id"]);
  const userID = req.session.user_id;
  // console.log('username_id', user_id);
  // console.log("userNameinsideURLS", userID);
  const urls = getUrlsForUser(userID);
  // console.log("urls for the user", urls);
  // console.log("users", users);
  const templateVars = { urls: urls, user: users[userID] };

  res.render("urls_index", templateVars);

});

//getting the short URL
app.get("/urls/:shortURL", (req, res) => {
  // console.log(res);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.session.user_id] };

  // console.log("short", urlDatabase[username_id]);

  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // console.log("SHORT", req.params.shortURL)
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
  const templateVars = { user: users[req.session.user_id] }

  res.render("register", templateVars)

});


//Login
app.get("/login", (req, res) => {
  // console.log("/login.get");
  const templateVars = { user: users[req.session.user_id] }

  res.render("login", templateVars)

});



///////////////////////// POST

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const randomShortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomShortUrl] = { longURL, userID: req.session.user_id };

  res.redirect(`/urls/${randomShortUrl}`);       // Respond with 'randomshortURL' 
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id; // holds the short id
  const longURL = req.body.longURL
  // console.log("SOME", longURL);

  res.redirect("/urls");

});

//REGISTER
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //check to see if e-mail or password are blank
  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank<a href= '/login'>Login</a>");
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
    password: hashedPassword
  }

  ///SHOWS THE PASSWORD COMING IN AS A HASH
  console.log(users[id]);

  req.session.user_id = id;

  //res.cookie("username_id", id);


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

  console.log("USER", user);



  // if that user exists with that email
  if (!user) {

    return res.status(403).send("No user with that email was found.<a href= '/login'>Login</a>");
  }

  // does the password provided from the request
  // match the password of the user

  //variable for comparing the password via reverse encryption
  const passwordBcrypt = bcrypt.compareSync(password, user.password);

  if (!passwordBcrypt) {
    return res.status(403).send(`Passwords did not match <a href= '/login'>Login</a>`)
  }




  // res.cookie("username_id", user.id);
  req.session.user_id = user.id;

  res.redirect("/urls");
})


//logout 
app.post("/logout", (req, res) => {
  // res.clearCookie("username_id")
  req.session = null;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


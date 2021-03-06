const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['aadsdasdasda'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.set("view engine", "ejs");

// Databases
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "esthersmart",
    },
  "9sm5xK": {
    longURL:"http://www.google.com",
    userID: "esthersmart",
    },
};

const users = {
  "esthersmart": {
    id: "esthersmart",
    email: "smart@esther.com",
    password: "esther"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
   "user3RandomID": {
    id: "user3RandomID",
    email: "u@a.b",
    password: "p"
  }
}

//GET requests

//root address
app.get("/", (req, res) => {
  const userId = req.session.userId;
  //check if user is logged in
  if (users[userId]) {
    let templateVars = {
      urls: urlsForUser(userId),
      user: users[userId],
    };
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  //check if user is logged in
  if (users[userId]) {
    let templateVars = {
      urls: urlsForUser(userId),
      user: users[userId],
    };
    res.render("urls_index", templateVars);
  } else {
    //potentially make error page
    res.status(403).send('Please <a href="/login">login</a> or <a href="/register">register</a>');
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  let templateVars = {
    user: users[userId]
  };
  if (!userId) {
    res.redirect("/login");
  } else {
  res.render("urls_new", templateVars);
  }
});

//Update/Edit page
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.userId;
  const urls = urlsForUser(req.session.userId);
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[userId]
  };
  if (!userId) {
    res.status(403).send('Please <a href="/login">login</a> to edit shortURLS.')
  //checks if user owns shortURL
  } else if (urls[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('This short url does not belong to you! Please <a href="/login">login</a> to your own account.');
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//redirects shortURLs to long URL website
app.get("/u/:shortURL", (req, res) => {
  const URLobj = urlDatabase[req.params.shortURL];
  if (URLobj) {
    res.redirect(URLobj.longURL);
  } else {
    res.status(403).send('This shortURL does not exist! Head back to <a href="/urls">urls</a>.');
  }
});

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  let templateVars = {
    user: users[userId]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  let templateVars = {
    user: users[userId]
  };
  res.render("login", templateVars);
});

//LOGOUT redirect to login screen
app.get("/logout", (req, res) => {
  res.redirect("/login");
});


//POST requests

// urls_new - save short & longURL to urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
   longURL: req.body.longURL,
   userID: req.session.userId
  }
  res.redirect(`/urls/${shortURL}`);
});

//urls_index - deletes the shortURLS (DELETE)
app.post("/urls/:shortURL/delete", (req, res) => {
  //checks if you own the URLS
  const urls = urlsForUser(req.session.userId);
  //checks if user owns shortURL
  if (urls[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls/`);
  } else {
    res.redirect(`/urls/`);
  }
});

//urls_show - updates the shortURLS (PUT/UPDATE)
app.post("/urls/:shortURL/", (req, res) => {
   //checks if you own the URLS
  const urls = urlsForUser(req.session.userId);
  if (urls[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect(`/urls/`);
});

//LOGIN form
app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUser(email);
  if (password === "") {
    res.status(403).send('Please enter your password! Try <a href="/login">again</a>.');
  } else if (!user) {
    res.status(403).send('No user with that email found! Try <a href="/login">again</a>.');
  } else if (bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send('Wrong password! Try <a href="/login">again</a>.');
  }
})

//POST register form
app.post("/register", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send('Please enter an email and password! Try <a href="/register">again</a>.');
  } else if (findUser(email)){
    res.status(400).send('This email is already registered! Try <a href="/register">again</a>.');
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    let id = generateRandomString();
    req.session.userId = id;
    users[id] = {
      id,
      email,
      password: hashedPassword
    };
    res.redirect("/urls");
  }
})

//logout
app.post("/logout", function (req, res) {
  //clears cookies
  req.session = null;
  res.redirect("/login");
})

//Functions

function urlsForUser(id) {
  let obj = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      obj[shortURL] = (urlDatabase[shortURL]);
    }
  }
  return obj;
}

function findUser(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

//produce a string of 6 random alphanumeric characters
function generateRandomString() {
let anysize = 6;
let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
let result= "";
  for (var i = 0; i < anysize; i++ ) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
return result;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  //renders all the URLS in urlDatabase
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//redirects shortURLs to long URL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"],
  };
  res.render("login", templateVars);
});

// //trying to redirect to login screen
// app.get("/logout", (req, res) => {
//   res.redirect("/login");
// });




//POST requests

// urls_new - save short & longURL to urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

//urls_index - deletes the shortURLS (DELETE)
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = generateRandomString();
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`)
});

//urls_show - updates the shortURLS (PUT/UPDATE)
app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/`)
});

//urls_index - sets cookie at login
app.post("/login", function (req, res) {
  //stores cookies as name and value
  res.cookie("user", req.body.user)
  res.redirect("/urls")
})

//logout
app.post("/logout", function (req, res) {
  res.clearCookie("user", req.params.user)
  res.redirect("/urls")
})

//POST /register
app.post("/register", function (req, res) {
  //adds new user object to global users object
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString();
  res.cookie("user_id", id)
  users[id] = {
    id,
    email,
    password
  }
  if (email === "" || password === "") {
    res.status(400).send("Please write your user and password");
  } else if (findUser(email)){
    res.status(400).send("This email is already registered");
  } else {
    res.redirect("/urls")
  }
})


//Functions

function findUser(email) {
  for (const user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    } else {
      return null;
    }
  }
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


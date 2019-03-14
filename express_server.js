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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aj48lW",
    },
  "9sm5xK": {
    longURL:"http://www.google.com",
    userID: "aJ49jW",
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

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"]
  //renders all the URLS in urlDatabase

  //check if user is logged in
  if (users[user_id]) {
    let templateVars = {
      urls: urlsForUser(user_id),
      user: users[user_id],
    };
    console.log(urlDatabase)
    res.render("urls_index", templateVars);
  } else {
    //potentially make error page
    res.status(403).end("Please login or register")
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"]
  let templateVars = {
    user: users[user_id]
  };
  if (!user_id) {
    res.redirect("/login")
  } else {
  res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"]
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[user_id]
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
  const user_id = req.cookies["user_id"]
  let templateVars = {
    user: users[user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"]
  let templateVars = {
    user: users[user_id]
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
   longURL:  req.body.longURL,
   userID: req.cookies["user_id"],
  }
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
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/`)
});

//LOGIN form
app.post("/login", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  let user = findUser(email);

  if (password === "") {
     res.status(403).end("Please enter your password!")
  } else if (!user) {
    res.status(403).end("No user with that email found!")
  } else if (password !== user.password) {
      res.status(403).send("Wrong password!");
  } else {
    //set the user_id cookie with matching user's id
    res.cookie("user_id", user.id)
    res.redirect("/urls")
  }
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

//logout
app.post("/logout", function (req, res) {
  res.clearCookie("user_id", req.params.user)
  res.redirect("/login")
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
  for (let user_id in users) {
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


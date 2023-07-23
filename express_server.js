const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

// Allow the app to use cookie parser
app.use(cookieParser());

const PORT = 8080; // default port 8080

// Set View Engine to EJS
app.set('view engine', 'ejs');

// To translate or parse the body of post request body
app.use(express.urlencoded({ extended: true }));

// Database to store database for testting purposes
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Database to store users -- for testing purposes
const users = {
  "be2716": {
    id: "be2716",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "4be271": {
    id: "4be271",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// helper function to check if email is alraedy in the database
const getUserByEmail = (email) => {
  for (const key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
};

// Generate six random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users.userId,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// For user long url to input
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users.userId
  };
  res.render("urls_new", templateVars);
});

// Handle form submission
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// Single URL
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = {
    user: users.userId,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Redirect request to /u/id to its longurl
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Registration Page
app.get("/register", (req, res) => {

  res.render("urls_registration");
});

// Add data from registration form to users database
app.post("/register", (req, res) => {

  // Empty email or password during registration
  if (!req.body ||!req.body.email ||!req.body.password) {
    res.send('400: Email or password cannot be empty!!');
  }
  // Check if email is already present in database
  if (getUserByEmail(req.body.email)) {
    res.send('400 Bad Request: Email already in use, try another one!!');
  }
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie("user_id", userId);

  res.redirect("/urls");
});

// Handle deleting urls and redirecting back to database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Handle editing urls and redirecting back to database
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] =  req.body.newURL;
  res.redirect("/urls");
});

// Endpoint for user login
app.post("/login", (req, res) => {
  // res.cookie("user_id", req.body.username);
  res.cookie("user_id", req.cookie["user_id"]);
  res.redirect("/urls");
});

// Endpoint for user logout
app.post("/logout", (req, res) => {
  // Clear the cookie
  // res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
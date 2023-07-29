const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const getUserByEmail = require("./helpers");
const app = express();

// Allow the app to use cookie session
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
}));

app.use(morgan('dev'));

const PORT = 8080; // default port 8080

// Set View Engine to EJS
app.set('view engine', 'ejs');

// To translate or parse the body of post request body
app.use(express.urlencoded({ extended: true }));

// Database to store database for testting purposes
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "be2716"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "be2716"
  },
  "auz1zf": {
    longURL: "https://www.caresmedicalclinic.com/",
    userID: "4be271"
  },
  "g8qxjm": {
    longURL: "https://www.facebook.com/",
    userID: "3oq0pt"
  },
  "z3yknf": {
    longURL: "https://medium.com/",
    userID: "4be271"
  },
  "koelxw": {
    longURL: "https://stackoverflow.com/",
    userID: "4be271"
  },
  "nqhcjc": {
    longURL: "https://github.com/jamesgeorge007",
    userID: "be2716"
  },
  "5iy25p": {
    longURL: "https://github.com/Olawill",
    userID: "3oq0pt"
  }
};

// Database to store users -- for testing purposes
const users = {
  "be2716": {
    id: "be2716",
    email: "user@example.com",
    password: "$2a$10$vD4RzjjoTwHUTeEhTPA4He7MEoZeGnOaRHhOBB8DTF6S4ZCE1ioZK" // "purple-monkey-dinosaur",
  },
  "4be271": {
    id: "4be271",
    email: "user2@example.com",
    password: "$2a$10$hd9R0NL7KmTx.suRKqMlTuM/FxkVeq2JU56fE2bA4oP1A/NSB0KvG" // "dishwasher-funk",
  },
  "3oq0pt": {
    id: "3oq0pt",
    email: "teedee@example.com",
    password: "$2a$10$yXB9h.vbwAKegJR0wp6MSejfI7Ys5Pmdg5jTTJETMDhi9K68Pgbae" // "4x6levsfifv",
  },
};

// Creata an object (table in the database) to track how 
// often the short url link was visited via /u/id
const visits = [];

/**
 * HELPER FUNCTIONS
 */
// helper function to check if email is already in the database

// GET USER URLS FROM DATABASE
const urlsForUser = (id, urlBase) => {
  let userURLs = {};
  
  for (const urlId in urlBase) {
    if (urlBase[urlId].userID === id) {
      userURLs[urlId] = urlBase[urlId];
    }
  }
  return userURLs;
};

// Generate six random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};
// ===========================================================

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
  const userId = req.session.user_id;

  const templateVars = {
    // To track the date the short url was created
    date: new Date().toLocaleDateString('en-CA'),

    user: users[userId],
    urls: urlsForUser(userId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

// For Users to create new short url
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);

});

// Endpoint for URL shortening
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(400).send("<b>Sorry, you cannot shorten URLs since you are not logged in/registered!</b>\n");
  }
  const id = generateRandomString();
  urlDatabase[id] = {longURL: req.body.longURL, userID: userId};
  res.redirect(`/urls/${id}`);
});

// Single URL - Edit the long urls
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;

  const templateVars = {
    user: users[userId],
    id: req.params.id,
    longURLInfo: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Redirect request to /u/id to its longurl
app.get("/u/:id", (req, res) => {
  
  const longURL = urlDatabase[req.params.id].longURL;

  if (longURL) {
    // visits.push({
    //   userId: req.params.id,
    //   visit: count + 1
    // });
    return res.redirect(longURL);
  }
  res.status(403).send("<b>Url does not exist or has moved!!!</b>\n");
});

/**
 * REGISTRATION ENDPOINT
 */
// Registration Page
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};

  // Check if user is logged in: User_id cookie would be set
  if (templateVars.user) {
    return res.redirect("/urls");
  }
  res.render("urls_registration", templateVars);
});

// Add data from registration form to users database
app.post("/register", (req, res) => {

  // Empty email or password during registration
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).send('Email or password cannot be empty!!');
  }
  // Check if email is already present in database
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send('Email already in use, try another one!!');
  }
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  // Set the cookie
  req.session.user_id = userId;

  res.redirect("/urls");
});

// Handle deleting urls and redirecting back to database
app.post("/urls/:id/delete", (req, res) => {
  // User ID after logging in
  const userId = req.session.user_id;

  // If the url ID provided does not exist
  if (userId && !urlDatabase[req.params.id]) {

    return res.status(404).send('Page Not Found!!!\n')
  }

  // User not logged in
  if (!userId) {
    console.log(urlDatabase[req.params.id]);
    return res.status(403).send('Please login or register to delete this url!!!\n');
  }

  // Check if user does not own the url
  if (userId && urlDatabase[req.params.id].userID !== userId) {
    return res.status(401).send(`You are unauthorized to delete ${req.params.id}\n`);
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Handle editing urls and redirecting back to database
app.post("/urls/:id", (req, res) => {
  // Login user ID
  const userId = req.session.user_id;

  // If the url ID provided does not exist
  if (userId && !urlDatabase[req.params.id]) {

    return res.status(404).send('Page Not Found!!!\n')
  }

  // User not logged in
  if (!userId) {

    return res.status(403).send('Please login or register to edit this url!!!\n');
  }

  // Check if user does not own the url
  if (userId && urlDatabase[req.params.id].userID !== userId) {
    return res.status(401).send(`You are unauthorized to edit ${req.params.id}\n`);
  }

  urlDatabase[req.params.id] =  {longURL: req.body.newURL};
  res.redirect("/urls");
});

/**
 * LOGIN PAGE RENDERING
 * GET route for rendering the page
 * POST route for handling user information
 */
// User login page rendering
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};

  // Check if user is logged in: User_id cookie would be set
  if (templateVars.user) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

// Endpoint for user login
app.post("/login", (req, res) => {
  // Extract the user info
  const userInfo = getUserByEmail(req.body.email, users);
  
  // Check if the email in the login form is present in the database
  if (!userInfo) {
    return res.status(403).send('403 Forbidden!');
  }

  // If email is found
  if (userInfo) {

    // Check if the password provided matches the one stored in database
    if (bcrypt.compareSync(req.body.password, userInfo.password)) {
      req.session.user_id = userInfo.id;
      return res.redirect("/urls");
    }
    res.status(400).send("Email or password is incorrect!!!");
  }
 
});

/**
 * LOGOUT BUTTON
 * Use only when the user id is present on page
 * Endpoint for user logout
*/
app.post("/logout", (req, res) => {

  // Clear the cookie
  req.session = null;

  res.redirect("/login");
});

/**
 * App listening os the specified port
 */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
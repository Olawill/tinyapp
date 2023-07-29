# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

TinyApp is a multipage app with: 
- Authentication Protection
- URL Shortening Service
- Visitor Analytics - to track the visits made to the Shortened URL

## Final Product

### <center>Home Page</center>
!["Home Page"](/doc/homepage.png)
### <center>URL Page For Each for User</center>
!["URL Page for user: user@example.com"](/doc/userURLsPage.png)
### <center>URL Edit Page</center>
!["Example Edit Page for Individual URLs created"](/doc/shortURLEditPage.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- Testing: 
  - Mocha
  - chai

## Getting Started

- Install all dependencies (using the `npm install` command).
- To run the app, edit the script in the package.json file to include the filename for the server
  - `scripts: {
    start: "./node_modules/.bin/nodemon -L filename"
  }`
- Run the development web server using the `node run start` command.
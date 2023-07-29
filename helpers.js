// Extract User info with matching email
const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
};



// EXPORTS
module.exports = getUserByEmail;
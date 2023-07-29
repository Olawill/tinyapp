// Extract User info with matching email
const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
};

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

// Modify the URL database to track visitors and visits
const visits = (database) => {
  const visitDate = new Date().toLocaleDateString('en-CA');

  for (const id in database) {
    if (!database[id].visit) {
      database[id].visit = {
        visitorCount: 0,
        visitHistory: [],
        uniqueVisitorCount: 0,
        visitorIDs: [],
        lastVisitTime: visitDate,
      };
    }
  }
  return database;
};

// Add visitor tracking to new urls
const addVisit = (id, database) => {
  const visitDate = new Date().toLocaleDateString('en-CA');
  
  database[id].visit = {
    visitorCount: 0,
    visitHistory: [],
    uniqueVisitorCount: 0,
    visitorIDs: [],
    lastVisitTime: visitDate,
  };
  return database;
};



// EXPORTS
module.exports = { getUserByEmail, urlsForUser, generateRandomString, visits, addVisit };
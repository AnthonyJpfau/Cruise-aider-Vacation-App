const express = require('express');
const app = express();
const session = require('express-session');
const axios = require('axios');
const fs = require('fs');

const JSONBIN_API_KEY = '652ef0d09207ee75c9cb7053'; // Replace with your JSONbin.io API key 
const JSONBIN_BASE_URL = `https://api.jsonbin.io/v3/b/653008f812a5d376598d6b8a`;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user data from JSONbin.io
    const response = await axios.get(`${JSONBIN_BASE_URL}/latest`, {
      headers: {
        'secret-key': JSONBIN_API_KEY,
      },
    });
    const data = response.data;
    console.log('Fetched data from JSONbin:', data);

    // Check if user input is received correctly
    console.log('Received username:', username);
    console.log('Received password:', password);

    // Find the user in the data
    const user = data.record.users.find((user) => user.username === username && user.password === password);

    if (user) {
      // User exists, store the username in the session
      req.session.username = username;
      console.log('Login successful');
      res.redirect('/mapPage.html');
    } else {
      // User doesn't exist, send an error message
      console.log('Login failed');
      res.status(401).send('User does not exist or incorrect username or password');
    }
  } catch (error) {
    // Handle errors
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
    res.status(500).send('Internal server error');
  }
});


// Serve static files
app.get('/', (req, res) => {
  // Serve the "homepage.html" file
  fs.readFile(`${__dirname}/homepage.html`, (err, data) => {
    if (err) {
      console.error('Error reading homepage.html:', err);
      res.status(500).send('Internal server error');
    } else {
      res.send(data);
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running');
});

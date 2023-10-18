const express = require('express');
const app = express();
const session = require('express-session');
const axios = require('axios');
const fs = require('fs');

const JSONBIN_API_KEY = '$2a$10$P8UeB64FsrRlrItjngXAZO11qSMuLdiaZszplOqDntVoukdimnJ6a'; // Replace with your JSONbin.io API key
const JSONBIN_BIN_ID = '653008f812a5d376598d6b8a'; // Replace with your JSONbin.io bin ID
const JSONBIN_BASE_URL = `https://api.jsonbin.io/b/${JSONBIN_BIN_ID}`;

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
    const user = data.users.find((user) => user.username === username && user.password === password);

    if (user) {
      req.session.username = username;
      console.log('Login successful');
      res.redirect('/mapPage.html');
    } else {
      console.log('Login failed');
      res.status(401).send('Incorrect username or password');
    }
  } catch (error) {
    console.error('Error connecting to JSONbin.io:', error);
  
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
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

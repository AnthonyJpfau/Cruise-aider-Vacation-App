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

    // Access the 'users' array
    const users = data.record.users;

    if (Array.isArray(users)) {
      const user = users.find((user) => user.username === username && user.password === password);

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
    } else {
      // Handle the case where 'users' is not an array
      console.log('No users data found or unexpected data structure.');
      res.status(500).send('Internal server error');
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



app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Fetch the existing data from JSONbin.io
    const response = await axios.get(`${JSONBIN_BASE_URL}/latest`, {
      headers: {
        'secret-key': JSONBIN_API_KEY,
      },
    });

    // Log the request data
    console.log('Request Data:', response.config);

    const data = response.data;

    // Ensure that the 'users' array exists in the data
    data.users = data.users || [];

    // Check if the user already exists
    const userExists = data.users.some(user => user.username === username || user.email === email);

    if (userExists) {
      // Send an error if the username or email already exists
      res.status(409).send('Username or email already exists. <br><a href="/">Go back</a>');
    } else {
      // Add the new user to the existing data
      const newUser = {
        username,
        password,
        email,
      };
      data.users.push(newUser);

      // Update the data on JSONbin.io
      await axios.put(`${JSONBIN_BASE_URL}/latest`, data, {
        headers: {
          'secret-key': JSONBIN_API_KEY,
        },
      });

      // Log the response data
      console.log('Response Data:', data);

      req.session.username = username;
      // Redirect to the game page or any other desired page
      res.redirect('/mapPage.html');
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
  // Serve the "homepage.html" file with the correct Content-Type
  fs.readFile(`${__dirname}/homepage.html`, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading homepage.html:', err);
      res.status(500).send('Internal server error');
    } else {
      // Set the Content-Type to text/html
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running');
});

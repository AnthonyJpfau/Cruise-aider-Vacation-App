const express = require('express');
const app = express();
const session = require('express-session');
const axios = require('axios');
const fs = require('fs');

const JSONBIN_API_KEY = '$2a$10$z4jAQxdXz5fi5wyxWX3xd..J3pKjUkqNwLR7tIicE0s0tujF4uZ363'; // Replace with your JSONbin.io API key 
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
    // Fetch current user data from JSONbin.io
    const response = await axios.get(`${JSONBIN_BASE_URL}/latest`, {
      headers: {
        'secret-key': JSONBIN_API_KEY,
      },
    });
    const users = response.data.record.users; // Extracting the users array from the record property

    if (Array.isArray(users)) {
      // Check if the user already exists using either username or email
      const existingUser = users.find(user => user.username === username || user.email === email);

      if (existingUser) {
        console.log('User already exists');
        res.status(400).send('User already exists');
      } else {
        // Add the new user to the users array
        users.push({
          username,
          password, // Note: Storing password in plain text is not safe. You should hash it.
          email,
          group: 'friend'
        });

        // Update the bin with the new users array directly
        await axios.put(`${JSONBIN_BASE_URL}`, {
          users: users // Sending the users array directly without wrapping in a record property
        }, {
          headers: {
            'secret-key': JSONBIN_API_KEY,
          },
        });

        console.log('User registration successful');
        req.session.username = username;
        res.redirect('/mapPage.html');
      }
    } else {
      console.log('No users data found or unexpected data structure.');
      res.status(500).send('Internal server error');
    }
  } catch (error) {
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
    res.status(500).send('Internal server error');
  }
});



app.get('/getUsername', (req, res) => {
  res.send(req.session.username);
});

app.get('/getGroup', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.username) {
      return res.status(401).send('User not logged in');
    }

    // Get user's information from JSONbin.io

    const response = await axios.get(`${JSONBIN_BASE_URL}/latest`, {
      headers: {
        'secret-key': JSONBIN_API_KEY
      }
    });

    const data = response.data;
    console.log("Data from JSONBin:", data);
    

    const userArray = data.record.users; 
    console.log("User Array:", userArray);

    const user = userArray.find(u => u.username === req.session.username);
    console.log("Found User:", user);
    console.log("Session Username:", req.session.username);

    if (!user) {
      return res.status(404).send('User not found in JSONbin.io');
    }

    // Return the user's group
    res.send(user.group);
  } catch (error) {
    console.error('Error retrieving group:', error);
    res.status(500).send('Server error');
  }
});


app.get('/logout', (req, res) => {
  // Destroy the session on logout
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
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
//fixed this code by npm install again

const express = require('express');
const app = express();
const session = require('express-session');
const axios = require('axios');
const fs = require('fs');
const fetch = require('node-fetch');


const JSONBIN_API_KEY = '$2a$10$z4jAQxdXz5fi5wyxWX3xd..J3pKjUkqNwLR7tIicE0s0tujF4uZ363'; // Replace with your JSONbin.io API key 
const JSONBIN_BASEUSER_URL = `https://api.jsonbin.io/v3/b/653008f812a5d376598d6b8a`;
const JSONBIN_BASEGROUP_URL =`https://api.jsonbin.io/v3/b/6542ab390574da7622c0b78a`;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));
app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user data from JSONbin.io
    const response = await axios.get(`${JSONBIN_BASEUSER_URL}/latest`, {
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
        req.session.userGroup = user.group;
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
    const response = await axios.get(`${JSONBIN_BASEUSER_URL}/latest`, {
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
        await axios.put(`${JSONBIN_BASEUSER_URL}`, {
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

/*
The getGroup server get method works by retreiving the express sessions username, and then displaying the users group from JSONBIn
*/
app.get('/getGroup', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.username) {
      return res.status(401).send('User not logged in');
    }

    // Get user's information from JSONbin.io

    const response = await axios.get(`${JSONBIN_BASEUSER_URL}/latest`, {
      headers: {
        'secret-key': JSONBIN_API_KEY
      }
    });

    const data = response.data;
    const userArray = data.record.users; 

    const user = userArray.find(u => u.username === req.session.username);
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

app.get('/getUsersInSameGroup', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.username) {
      return res.status(401).send('User not logged in');
    }

    const response = await axios.get(`${JSONBIN_BASEUSER_URL}/latest`, {
      headers: {
        'secret-key': JSONBIN_API_KEY
      }
    });

    const users = response.data.record.users;
    const currentUser = users.find(u => u.username === req.session.username);

    if (!currentUser) {
      return res.status(404).send('Current user not found');
    }

    // Filter out users that are in the same group as the current user.
    const usersInSameGroup = users.filter(u => u.group === currentUser.group && u.username !== req.session.username);

    res.json(usersInSameGroup);

  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).send('Server error');
  }
});



app.post('/updateGroupLocation', async (req, res) => {
  const { group, location, username } = req.body;
  console.log('Received request:', req.body);
  console.log('Received request for group:', group);

  try {
      // Fetch the current group data from JSONBin
      const response = await axios.get(`${JSONBIN_BASEGROUP_URL}/latest`, {
          headers: {
              'secret-key': JSONBIN_API_KEY
          }
      });

      console.log('JSONBin response:', response.data);

      // Access the 'groups' array inside the nested 'record' object
      const groups = response.data.record.record.groups;

      console.log('Fetched groups:', groups);

      if (Array.isArray(groups)) {
          const groupData = groups.find(g => g.group === group);

          if (groupData) {
              // Include the locationId in the location object
              groupData.locations.push({ ...location, submittedBy: username });

              // Send the updated data back to JSONBin
              await axios.put(`${JSONBIN_BASEGROUP_URL}`, {
                  record: { groups: groups }  // Update the 'record' object
              }, {
                  headers: {
                      'secret-key': JSONBIN_API_KEY,
                      'Content-Type': 'application/json'
                  }
              });

              console.log('Location updated successfully');
              res.send({ message: 'Location updated successfully' });
          } else {
              console.log('Group not found');
              res.status(404).send({ message: 'Group not found' });
          }
      } else {
          console.log('No group data found or unexpected data structure.');
          res.status(500).send('Internal server error');
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal server error');
  }
});


app.get('/getGroupLocations', async (req, res) => {
  console.log("Received request for group locations");
  try {
      // Check if user is logged in
      if (!req.session.username) {
          return res.status(401).send('User not logged in');
      }
      console.log("User logged in with username: ", req.session.username);
      // Get user's information from JSONbin.io
      const userResponse = await axios.get(`${JSONBIN_BASEUSER_URL}/latest`, {
          headers: {
              'secret-key': JSONBIN_API_KEY
          }
      });
      console.log("User data response: ", userResponse.data);

      const userData = userResponse.data;
      const userArray = userData.record.users; 

      const user = userArray.find(u => u.username === req.session.username);

      if (!user) {
          return res.status(404).send('User not found in JSONbin.io');
      }

      // Fetch the group data from JSON bin
      const groupResponse = await axios.get(`${JSONBIN_BASEGROUP_URL}/latest`, {
          headers: {
              'secret-key': JSONBIN_API_KEY
          }
      });
      console.log("Group data response: ", groupResponse.data);
      // Adjusted to correctly access the groups array
      const groupData = groupResponse.data.record.record.groups;
      console.log("Groups array:", groupData);

      const userGroup = groupData.find(g => g.group === user.group);

      if (!userGroup) {
          return res.status(404).send('Group not found');
      }

      // Send the locations of the user's group to the client
      console.log("Sending locations for group: ", userGroup.locations);
      res.json(userGroup.locations);
  } catch (error) {
      console.error('Error retrieving group locations:', error);
      res.status(500).send('Server error');
  }
});

app.post('/submit-comment', async (req, res) => {
  const { comment, group, username } = req.body;

  try {
      const groupDataResponse = await axios.get(`${JSONBIN_BASEGROUP_URL}/latest`, {
          headers: { 'secret-key': JSONBIN_API_KEY },
      });

      // Check the structure of the response
      if (!groupDataResponse.data || !groupDataResponse.data.record || !groupDataResponse.data.record.record || !Array.isArray(groupDataResponse.data.record.record.groups)) {
          console.error("Invalid structure in group data response:", groupDataResponse.data);
          return res.status(500).send("Invalid data structure in group data response");
      }

      const groups = groupDataResponse.data.record.record.groups;
      const groupIndex = groups.findIndex(g => g.group === group);

      if (groupIndex === -1) {
          console.error("Group not found in JSONBin:", group);
          return res.status(400).send("Group not found");
      }

      // Create a comment object with text and the username
      const commentObject = { text: comment, submittedBy: username };
      groups[groupIndex].comments.push(commentObject);

      // Update the JSONBin with the new groups data
      await axios.put(`${JSONBIN_BASEGROUP_URL}`, { record: { groups: groups } }, {
          headers: { 'secret-key': JSONBIN_API_KEY, 'Content-Type': 'application/json' },
      });

      res.status(200).send("Comment submitted");
  } catch (error) {
      console.error("Error in /submit-comment:", error);
      res.status(500).send("Error submitting comment");
  }
});

app.get('/fetch-comments', async (req, res) => {
  // Retrieve userGroup from the session
  const userGroup = req.session.userGroup;

  // Logging after userGroup is defined
  console.log("User Group from session:", userGroup);

  if (!userGroup) {
      console.error("User group not found in session");
      return res.status(400).send("User group not found");
  }

  try {
      const groupDataResponse = await axios.get(`${JSONBIN_BASEGROUP_URL}/latest`, {
          headers: { 'secret-key': JSONBIN_API_KEY },
      });

      // Check if the groups data is structured correctly
      if (!groupDataResponse.data || !groupDataResponse.data.record || !groupDataResponse.data.record.record || !Array.isArray(groupDataResponse.data.record.record.groups)) {
          console.error("Invalid structure in group data response:", groupDataResponse.data);
          return res.status(500).send("Invalid data structure in group data response");
      }

      const groups = groupDataResponse.data.record.record.groups;
      const group = groups.find(g => g.group === userGroup);

      if (!group) {
          console.error("Group not found in JSONBin:", userGroup);
          return res.status(400).send("Group not found");
      }

      // Send the comments of the found group
      res.json(group.comments || []);
  } catch (error) {
      console.error("Error in /fetch-comments:", error);
      res.status(500).send("Error fetching comments");
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

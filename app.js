function loadGoogleMapsAPI(callbackName) {
  if (!window.google || !window.google.maps) {
      var script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=REPLACE_API_KEY_HERE&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
  } else {
      if (typeof window[callbackName] === "function") {
          window[callbackName]();
      }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('map')) {
      loadGoogleMapsAPI('initMap');
  } else if (document.getElementById('mapGroup')) {
      loadGoogleMapsAPI('initMapGroup');
  }
  document.getElementById('commentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const comment = document.getElementById('userComment').value;
    submitComment(comment);
});
fetchAndDisplayComments();
});



fetch('/getUsername')
  .then(res => res.text())
  .then(data => {
    const usernameElem = document.getElementById('username');
    if (usernameElem) usernameElem.textContent = data;
  })
  .catch(error => {
    console.error('Error fetching username:', error);
  });

// Fetch the user's group and display it
//this is a test comment

fetch('/getGroup')
  .then(res => res.text())
  .then(data => {
    const groupElem = document.getElementById('userGroup');
    if (groupElem) groupElem.textContent = 'Group name: ' + data;
  })
  .catch(error => {
    console.error('Error fetching group:', error);
    const groupElem = document.getElementById('userGroup');
    groupElem.textContent = 'Error fetching group';
  });


  document.addEventListener('DOMContentLoaded', () => {
    fetch('/getUsersInSameGroup')
      .then(res => res.json())
      .then(users => {
        const membersList = document.getElementById('groupMembers');
  
        if (users.length === 0) {
          membersList.innerHTML = '<li>No other members in your group.</li>';
          return;
        }
  
        // Populate the list with usernames and emails of the users in the same group.
        users.forEach(user => {
          const listItem = document.createElement('li');
  
          // Create a div for the username
          const usernameDiv = document.createElement('div');
          usernameDiv.textContent = user.username;
          usernameDiv.className = 'username';  // Adding a class for potential styling
          listItem.appendChild(usernameDiv);
  
          // Create a div for the email
          const emailDiv = document.createElement('div');
          emailDiv.textContent = user.email;
          emailDiv.className = 'email';  // Adding a class for potential styling
          listItem.appendChild(emailDiv);
  
          // Append the listItem to the members list
          membersList.appendChild(listItem);
        });
  
      })
      .catch(error => {
        console.error('Error fetching group members:', error);
      });
  });


  
// Create a function to load the Google Maps code

// Replace 'YOUR_API_KEY' with your actual Google Maps API key
const apiKey = REPLACE_API_KEY_HERE

let map;
let mapGroup;
let currentMarker; // This will store the current marker if one exists
let clickedLat, clickedLng; // Variables to store the latitude and longitude

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of the United States
      zoom: 4 // Initial zoom level
  });

  // Event listener for map click
  map.addListener('click', function(event) {
      clickedLat = event.latLng.lat();
      clickedLng = event.latLng.lng();
      
      // Update the display for latitude and longitude
      document.getElementById('displayLat').innerText = clickedLat;
      document.getElementById('displayLng').innerText = clickedLng;

      // Remove the previous marker if it exists
      if (currentMarker) {
          currentMarker.setMap(null);
      }

      // Place a new marker at the clicked location
      currentMarker = new google.maps.Marker({
          position: event.latLng,
          map: map
      });
  });
}

// Add an event listener for the submit button
document.getElementById('submitLocation').addEventListener('click', function() {
  // First, fetch the username
  fetch('/getUsername')
      .then(res => res.text())
      .then(username => {
          if (username) {
              // Then fetch the user's group
              fetch('/getGroup')
                  .then(res => res.text())
                  .then(userGroup => {
                      if (userGroup) {
                          // Assuming clickedLat and clickedLng are available globally
                          updateGroupLocation(userGroup, clickedLat, clickedLng, username);
                      }
                  })
                  .catch(error => {
                      console.error('Error fetching group:', error);
                  });
          }
      })
      .catch(error => {
          console.error('Error fetching username:', error);
      });

      
});

function updateGroupLocation(userGroup, lat, lng, username) {
  // Generate a unique location ID
  const locationId = Date.now() + Math.floor(Math.random() * 1000);

  const data = {
      group: userGroup,
      location: { lat: lat, lng: lng, locationId: locationId },
      username: username  // Include the username in the data sent to the server
  };
  console.log('Sending data:', data);

  fetch('/updateGroupLocation', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      console.log('Response:', data);
      // Display a popup message once the location is successfully sent
      alert('Location sent to your group!');
  })
  .catch((error) => {
      console.error('Fetch error:', error);
  });
}


function initMapGroup() {
  mapGroup = new google.maps.Map(document.getElementById('mapGroup'), {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4
  });

  // Ensure the map object is fully created
  if (mapGroup instanceof google.maps.Map) {
      displayGroupLocations(mapGroup);
  } else {
      console.error('Map initialization failed');
  }
}

window.addEventListener("load", function(event) {
  initMapGroup();
});

function displayGroupLocations(map) {
  console.log('Map instance in displayGroupLocations:', map);
  fetch('/getGroupLocations')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(locations => {
          locations.forEach(location => {
              const position = { lat: location.lat, lng: location.lng };
              const marker = new google.maps.Marker({
                  position: position,
                  map: map
              });

              // Create an InfoWindow
              const infoWindow = new google.maps.InfoWindow({
                  content: `<div>Submitted by: ${location.submittedBy}</div>`
              });

              // Add a click listener to the marker to open the InfoWindow
              marker.addListener('click', () => {
                  infoWindow.open(map, marker);
              });
          });
      })
      .catch(error => {
          console.error('Error fetching group locations:', error);
      });
}

function submitComment(comment) {
  // Fetch the username
  fetch('/getUsername')
      .then(response => response.text()) // Handle the response as text
      .then(username => {
          // Rest of your logic...
          fetch('/getGroup')
              .then(res => res.text())
              .then(userGroup => {
                  fetch('/submit-comment', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ comment: comment, group: userGroup, username: username })
                  })
                  // ... rest of the existing fetch logic ...
              })
              .catch(error => console.error('Error fetching user group:', error));
      })
      .catch(error => console.error('Error fetching username:', error));
}

function fetchAndDisplayComments() {
    fetch('/fetch-comments')
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(comments => {
            const commentsDisplay = document.getElementById('commentsDisplay');
            commentsDisplay.innerHTML = ''; // Clear existing comments

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');

                // Combine the username and comment text in one element
                const combinedCommentElement = document.createElement('p');
                combinedCommentElement.textContent = `${comment.submittedBy}: ${comment.text}`;
                combinedCommentElement.classList.add('combined-comment');

                commentElement.appendChild(combinedCommentElement);
                commentsDisplay.appendChild(commentElement);
            });
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
            const commentsDisplay = document.getElementById('commentsDisplay');
            commentsDisplay.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

document.getElementById('zoomButton').addEventListener('click', () => {
  const stateName = document.getElementById('stateInput').value;

  // Geocode the entered state name to get its coordinates
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: `${stateName}, USA` }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
          const stateBounds = results[0].geometry.viewport;
          map.fitBounds(stateBounds);
      } else {
          alert('State not found. Please enter a valid U.S. state name.');
      }
  });
});


  
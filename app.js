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

      // Populate the list with usernames of the users in the same group.
      users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = user.username;
        membersList.appendChild(listItem);
      });

    })
    .catch(error => {
      console.error('Error fetching group members:', error);
    });
});


  
// Create a function to load the Google Maps code
function loadGoogleMap() {
  // Create a <script> element for Google Maps API
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDueM6P1BJmPhKC2Cp5jl6ufGPHMA4XC9o&callback=initMap';
  script.async = true;
  script.defer = true;

  // Define the callback function to initialize the map
  script.onload = function() {
      initMap();
  };

  // Append the <script> element to the document's <head>
  document.head.appendChild(script);
}

// Call the function to load Google Maps when the page is loaded
window.onload = loadGoogleMap;

// Replace 'YOUR_API_KEY' with your actual Google Maps API key
const apiKey = 'KAIzaSyDueM6P1BJmPhKC2Cp5jl6ufGPHMA4XC9o';

let map;
let currentMarker; // This will store the current marker if one exists

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of the United States
      zoom: 4 // Initial zoom level
  });

  // Event listener for map click to show coordinates and place a temporary marker
  map.addListener('click', function(event) {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();

      // Remove the previous marker if it exists
      if (currentMarker) {
          currentMarker.setMap(null);
      }

      // Place a new marker at the clicked location
      currentMarker = new google.maps.Marker({
          position: event.latLng,
          map: map
      });

      // Add an event listener for marker clicks
      currentMarker.addListener('click', function() {
          const isConfirmed = confirm('Do you want to send this location to the group?');
          if (isConfirmed) {
              sendLocationToGroup(currentMarker.getPosition());
          }
      });

      setTimeout(function() {
          alert('You Marked a location at: ' + clickedLat + ', ' + clickedLng);
      }, 50);  // Delay of 50 milliseconds
  });
}

function sendLocationToGroup(position) {
  const binId = '6542ab390574da7622c0b78a'; // Replace with your JSONbin bin ID
  const apiKey = 'KAIzaSyDueM6P1BJmPhKC2Cp5jl6ufGPHMA4XC9o'; // Replace with your JSONbin API key
  const apiUrl = `https://api.jsonbin.io/b/${binId}`;
  const headers = {
      'Content-Type': 'application/json',
      'secret-key': apiKey,
      'versioning': 'false'
  };

  // First, get the group associated with the logged-in user
  fetch('/getGroup')
  .then(res => res.text())
  .then(userGroup => {
      // Next, fetch the data from JSONbin
      return fetch(apiUrl, { headers: headers })
      .then(response => response.json())
      .then(data => {
          const groupToUpdate = data.groups.find(group => group.group === userGroup);
          if (groupToUpdate) {
              // Add the new location to the locations array for the group
              const newLocation = `${position.lat()},${position.lng()}`;
              groupToUpdate.locations.push(newLocation);

              // Update the JSONbin with the new locations array
              return fetch(apiUrl, {
                  method: 'PUT',
                  headers: headers,
                  body: JSON.stringify(data)
              });
          } else {
              throw new Error('Group not found.');
          }
      })
  })
  .then(response => {
      if (response.ok) {
          alert('Location added to group successfully!');
      } else {
          alert('Failed to update the location.');
      }
  })
  .catch(error => {
    console.error('Detailed Error:', error.message); // Will print the error message to the console.
    alert('An error occurred: ' + error.message);
    console.error('Error retrieving group:', error.response || error);
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

  
  
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
  // Fetch user's group
  fetch('/getGroup')
      .then(res => res.text())
      .then(userGroup => {
          if (userGroup) {
              // Assuming clickedLat and clickedLng are available globally
              updateGroupLocation(userGroup, clickedLat, clickedLng);
          }
      })
      .catch(error => {
          console.error('Error fetching group:', error);
          // Handle the error appropriately
      });
});

function updateGroupLocation(userGroup, lat, lng) {
  // Send the updated location to the server
  const data = {
      group: userGroup,
      location: { lat: lat, lng: lng }
  };

  fetch('/updateGroupLocation', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
      console.log('Success:', data);
      // Handle success response
  })
  .catch((error) => {
      console.error('Error:', error);
      // Handle errors here
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

  
  
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
    if (groupElem) groupElem.textContent = 'Your group: ' + data;
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
    script.onload = function () {
      initMap();
    };
  
    // Append the <script> element to the document's <head>
    document.head.appendChild(script);
  }
  
  // Create a function to initialize the map

  
  // Call the function to load Google Maps when the page is loaded
  window.onload = loadGoogleMap;

        // Replace 'YOUR_API_KEY' with your actual Google Maps API key
        const apiKey = 'KAIzaSyDueM6P1BJmPhKC2Cp5jl6ufGPHMA4XC9o';

        let map;

        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 39.8283, lng: -98.5795 }, // Center of the United States
                zoom: 4 // Initial zoom level
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
  
  
// Create a function to load the Google Maps code
function loadGoogleMap() {
    // Create a <script> element for Google Maps API
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=KEY_GOES_HERE&callback=initMap';
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
  function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: { lat: 39.708, lng: -75.121 }
    });
  
    var kmlLayer = new google.maps.KmlLayer({
      url: 'https://www.google.com/maps/d/u/0/edit?mid=1SVrHcKkeRKkaSeGMJVzFNlPcH46DV5U&usp=sharing',
      map: map
    });
  }
  
  // Call the function to load Google Maps when the page is loaded
  window.onload = loadGoogleMap;
  
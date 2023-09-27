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
      zoom: 8,
      center: { lat: 41.876, lng: -87.624 }
    });
  
    var kmlLayer = new google.maps.KmlLayer({
      url: 'https://www.veuzz.com/kml/examples.kml',
      map: map
    });
  }
  
  // Call the function to load Google Maps when the page is loaded
  window.onload = loadGoogleMap;
  
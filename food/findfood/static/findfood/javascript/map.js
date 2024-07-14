let map;
const markers = [];

function initMap() {
  const position = { lat: 48.46381157109268, lng: -123.33112714045642 };

  // The map, centered at the initial position
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: position,
  });

  // Initial marker, positioned at the initial position
  const marker = new google.maps.Marker({
    position: position,
    map: map,
    title: "Start",
  });

  // Add click event listener to the map for adding markers
  map.addListener("click", (event) => {
    addMarker(event.latLng);
  });

  document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value;
    searchPlace(query, marker.getPosition(), 1000);
  });

  document.getElementById('coordSearchButton').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('latBox').value);
    const lng = parseFloat(document.getElementById('lngBox').value);
    if (!isNaN(lat) && !isNaN(lng)) {
      searchPlace(document.getElementById('search-input').value, new google.maps.LatLng(lat, lng), 1000);
    } else {
      alert('Please enter valid coordinates');
    }
  });
}

// Function to add a marker at the clicked location
function addMarker(location) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
  });
  markers.push(marker);

  // Add click event listener to the marker for removing it
  marker.addListener("click", () => {
    removeMarker(marker);
  });
}

// Function to remove a specific marker
function removeMarker(marker) {
  marker.setMap(null);
  markers.splice(markers.indexOf(marker), 1);
}

// Recursive function to search for a place with increasing radius
function searchPlace(query, location, radius) {
  const service = new google.maps.places.PlacesService(map);

  // Perform text search first
  const textSearchRequest = {
    query: query,
    location: location,
    radius: radius
  };

  service.textSearch(textSearchRequest, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
      // Find the nearest place from text search results
      let nearestPlace = findNearestPlace(results, location);

      // If we find a result within the initial radius, use it
      if (nearestPlace) {
        addMarker(nearestPlace.geometry.location);
        map.setCenter(nearestPlace.geometry.location);
      }
    } else if (radius < 500000) {
      // Increase the radius and try again if no results or search needs to cover more area
      searchPlace(query, location, radius + 10000);
    } else {
      alert('Place not found. Status: ' + status);
    }
  });
}

// Function to find the nearest place from a list of places
function findNearestPlace(places, location) {
  let nearestPlace = null;
  let nearestDistance = Infinity;

  places.forEach((place) => {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(location, place.geometry.location);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPlace = place;
    }
  });

  return nearestPlace;
}

initMap();

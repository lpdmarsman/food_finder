let map;
const markers = [];

function initMap() {
  
  if (navigator.geolocation) {
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 14,
          center: pos,
        });

        const marker = new google.maps.Marker({
          position: pos,
          map: map,
          title: "Your Location",
        });

        map.addListener("click", (event) => {
          addMarker(event.latLng);
        });

        document.getElementById('search-button').addEventListener('click', () => {
          const query = document.getElementById('search-input').value;
          searchPlace(query, marker.getPosition(), 1000);
        });

      },
      () => {
        handleLocationError(true, map.getCenter());
      }
    );
  } else {
    
    handleLocationError(false, map.getCenter());
  }
}

function addMarker(location) {
    const marker = new google.maps.Marker({
      position: location,
      map: map,
    });
  
    markers.push(marker);
  
    const service = new google.maps.places.PlacesService(map);
    const request = {
      location: location,
      radius: '50'
    };
  
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const place = results[0]; // Get the first result
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div><strong>${}
            <div><strong>${place.name}</strong></div>
            <div>Address: ${place.vicinity}</div>
            
        
          `,
        });
        infoWindow.open(map, marker);
      } 
    });
  
    marker.addListener("click", () => {
      removeMarker(marker);
    });
  }

function removeMarker(marker) {
  marker.setMap(null);
  markers.splice(markers.indexOf(marker), 1);
}

function searchPlace(query, location, radius) {
  const service = new google.maps.places.PlacesService(map);

  const textSearchRequest = {
    query: query,
    location: location,
    radius: radius,
  };

  service.textSearch(textSearchRequest, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
     
      let nearestPlace = findNearestPlace(results, location);

      if (nearestPlace) {
        addMarker(nearestPlace.geometry.location);
        map.setCenter(nearestPlace.geometry.location);
      }
    } else if (radius < 500000) {
      searchPlace(query, location, radius + 10000);
    } else {
      alert('Place not found. Status: ' + status);
    }
  });
}

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

function handleLocationError(browserHasGeolocation, pos) {
  alert(browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Enable Location/Unsupported");
}

initMap();

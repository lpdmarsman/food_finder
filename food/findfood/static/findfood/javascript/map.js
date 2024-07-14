let map;
const markers = [];

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

const roomName = JSON.parse(document.getElementById('room-name').textContent);

const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + roomName
    + '/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const messageType = data.type;
    const message = data.message;

    if (messageType === 'chat') {
        let username = getCookie('username');
        document.querySelector('#chat-log').value += (username + ": " + message + '\n');
    } else if (messageType === 'location') {
        const { lat, lng } = message;
        const location = new google.maps.LatLng(lat, lng);
        addMarker(location);
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'type': 'chat',
        'message': message
    }));
    messageInputDom.value = '';
};

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
                console.log("Geolocation service failed.");
            }
        );
    } else {
        console.log("Browser doesn't support geolocation.");
    }
}

// Function to add a marker
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
            const place = results[0];
            const infoWindow = new google.maps.InfoWindow({
                content: `
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

    // Send marker position to other sockets
    chatSocket.send(JSON.stringify({
        'type': 'location',
        'message': {
            'lat': location.lat(),
            'lng': location.lng()
        }
    }));
}


// Removes Marker if it exists by clicking
function removeMarker(marker) {
    marker.setMap(null);
    markers.splice(markers.indexOf(marker), 1);
}

// Function to search a place
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

                // Send searched place location to other sockets
                chatSocket.send(JSON.stringify({
                    'type': 'location',
                    'message': {
                        'lat': nearestPlace.geometry.location.lat(),
                        'lng': nearestPlace.geometry.location.lng()
                    }
                }));
            }
        } else if (radius < 500000) {
            searchPlace(query, location, radius + 10000);
        } else {
            alert('Place not found. Status: ' + status);
        }
    });
}

// Computes the nearest distance, this is how it locates the nearest location based on the centered marker
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
    alert(browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation.");
}

initMap();

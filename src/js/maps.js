

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelectorAll('#map').length > 0) {
        let jsFile = document.createElement('script');
        jsFile.type = 'text/javascript';
        jsFile.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio&callback=initMap';
        document.getElementsByTagName('head')[0].appendChild(jsFile);
    }
});

// Initialize the Firebase SDK
firebase.initializeApp({
    apiKey: 'AIzaSyDHQfVnj8-EI6WHLkXNl1kJzLv4NRH8Bio',
    databaseURL: 'https://bloeddonatie-bd78c.firebaseio.com'
});

// Generate a reference to database
let firebaseRef = firebase.database();

// Initialise map and all its features
function initMap() {

    // Initialise map and center it to x location
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: { lat: 51.04060 , lng: 3.70976 }
    });
    // Initialise geocoder object
    let geocoder = new google.maps.Geocoder();
    // Initialise only one infoWindow at a time
    let infoWindow = new google.maps.InfoWindow();

    document.getElementById('locationBtn').onclick = function () {
        // Location object
        let name = document.getElementById('locationName').value;
        let street = document.getElementById('locationStreet').value;
        let streetNumber = document.getElementById('locationStreetNumber').value;
        let city = document.getElementById('locationCity').value;
        let isMobile = false;

        addLocation(geocoder, map, name, street, streetNumber, city, isMobile);
    }

    google.maps.event.addListener(map, 'click', function() {
        infoWindow.close();
    });

    renderMarkers(map, infoWindow);

    testLocationClass();
};

// Add a location to the database
let addLocation = function(geocoder, resultsMap, name, street, streetNumber, city, isMobile) {

    let address = streetNumber + ' ' + street + ', ' + city + ', ' + 'BE';

    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);

            let lat = results[0].geometry.location.lat();
            let lng = results[0].geometry.location.lng();

            // add location to database
            let itemId = firebaseRef.ref('loacations_test').push().getKey();
            firebaseRef.ref('locations_test').child(itemId).set({
                id: itemId,
                name: name,
                street: street,
                streetNumber: streetNumber,
                city: city,
                isMobile: isMobile,
                lat: lat,
                lng: lng
            });

            // add location to geofire
            let location =  [lat, lng];
            let firebaseRefLocationsGeo = firebaseRef.ref('locations_geo_test/' + itemId);
            let geoFire = new GeoFire(firebaseRefLocationsGeo);
            geoFire.set('location', location);

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
};

function deleteLocation() {

};

function renderMarkers(resultsMap, infoWindow) {
    
    let locations = firebaseRef.ref('locations_test');
    
    locations.on('child_added', function(location) {
        renderMarker(resultsMap, infoWindow, location);
    });

    locations.on('child_removed', function(location) {

    });

    locations.on('child_changed', function(location) {
        
    });

    locations.on('child_moved', function(location) {
        
    });
};

let renderMarker = function(resultsMap, infoWindow, location) {

    let marker = new google.maps.Marker({
        position: { lat:  location.val().lat, lng: location.val().lng },
        map: resultsMap
    });

    let name = '<h3>' + location.val().name + '</h3>';
    let address = '<p>' + location.val().street + ' ' + location.val().streetNumber + ', ' + location.val().city + '</p>';
    let content = name + address;

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(content);
        infoWindow.open(resultsMap, marker);
    });
}

class Test {
    contructor(x, y) {
        this._x = x;
        this._y = y;
    }

    sum() {
        return this._x + this._y;
    }
}

let testLocationClass = function() {
    let locations = firebaseRef.ref('locations_test');

    locations.on('child_added', function(l) {
        let locationObject = new Location(l.val().id, l.val().name, l.val().street, l.val().streetNumber, l.val().city, l.val().lat, l.val().lng, l.val().isMobile);
        let test1 = new Test(1, 2);
        console.log(test1.sum());
    });
}

let removeMarker = function(resultsMap, location) {

};

// Location class storing everything needed to update markers and geoFire
class Location {

    contructor(id, name, street, streetNumber, city, lat, lng, isMobile) {

        // Properties
        this.id = id;
        this._name = name;
        this._street = street;
        this._streetNumber = streetNumber;
        this._city = city;
        this._lat = lat;
        this._lng = lng;
        this._isMobile = isMobile;
        this._marker;
        this._geoFire;

        // Setters
        this.setName = function(name) {
            this._name = name;
        }

        this.setAddress = function(street, streetNumber, city) {
            this._street = street;
            this._streetNumber = streetNumber;
            this._city = city;
        }

        this.setCoordinates = function(lat, lng) {
            this._lat = lat;
            this._lng = lng;
        }

        this.setMarker = function(marker) {
            this._marker;
        }

        this.setGeoFire = function(geoFire) {
            this._geoFire = geoFire;
        }

    }

    // Getters
    getId() {
        return this.id;
    }

    getInfo() {
        return '<h3>' + this._name + '</h3>' + '<p>' + this._street + ' ' + this._streetNumber + ', ' + this._city + '</p>';
    }

    getLAT() {
        return this._lat;
    }

    getLNG() {
        return this._lng;
    }

    getMarker() {
        return this._marker;
    }

    getGeoFire() {
        return this._geoFire;
    }

    // Setters
    
}




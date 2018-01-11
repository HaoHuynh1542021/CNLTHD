var map, geoCoder, infowindow;
function Person(data) {

    var _data = $.extend({}, {
        hasShow: false,
        marker: false,
        index: 0,
        lat: -34.397,
        lng: 150.644,
        draggable: true,
        sockId: false,
        diachi: "Ho Chi Minh",
        hasChangePosition: false,
        markerImg: 'http://maps.google.com/mapfiles/ms/micons/red.png'
    }, data), self = this;


    this.setId = function (id) {
        _data.id = id;
    };

    this.getId = function () {
        return _data.id;
    };

    this.getData = function(){
        return _data;
    };

    this.clearMarkerData = function(){
        google.maps.event.clearListeners(_data.marker,'click');
        google.maps.event.clearListeners(_data.marker,'dragend');
        google.maps.event.clearListeners(_data.marker,'dragstart');
        if(_data.marker) {
            _data.marker.setMap(null);
        }
    };
    this.updatePosition = function(position){
        if (_data.marker) {
            _data.marker.setPosition(position);
        } else {
            this.initMarker(position);
        }
    };

    this.initMarker = function (position) {
        if (_data.marker) {
            _data.marker.setPosition(position);
			return true;
        }
        if (!position) {
            position = {lat: _data.lat, lng: _data.lng};
        }
        _data.marker = new google.maps.Marker({
            map: map,
            draggable: _data.draggable,
            icon: _data.markerImg,
            position: position
        });
        this.initMarkerEvent(_data.marker);
    };

    this.initMarkerEvent = function (marker) {
        var self = this;
        marker.addListener('click', self.clickMarker);
        marker.addListener('dragend', self.dragEnd);
        marker.addListener('dragstart', self.dragStart);
    };

    this.dragEnd = function () {
        var Position = this.getPosition();
        self.geocodeLatLng(Position, _data.target);
    };

    this.dragStart = function () {
        _data.oldPositions = this.getPosition();
    };

    this.clickMarker = function (e) {
        if(!infowindow){
            infowindow = new google.maps.InfoWindow;
        }
        infowindow.setContent("Địa Chỉ: " + _data.address + "<br/> Sdt: " + _data.sdt);
        infowindow.open(map,  _data.marker);
    };
    
    this.hideOnMap = function(){
        if (_data.marker) {
            _data.marker.setMap(null);
        }
        _data.hasShow = false;
    };
    
    this.showMe = function(animate){
        if (animate && _data.marker) {
            _data.marker.setAnimation(google.maps.Animation.BOUNCE);
        } else if(_data.marker){
            _data.marker.setAnimation(null);
        }
    };
    
    this.showToMap = function () {
        if(!_data.hasChangePosition) {
            if (!_data.marker) {
                if (_data.diachi) {
                    this.geoCodeAddress(_data.diachi);
                } else if (_data.lat && _data.lng) {
                    this.geocodeLatLng({lat: _data.lat, lng: _data.lng});
                }
            } else {
                _data.marker.setMap(map);
            }
        } else {
            this.geocodeLatLng({lat: _data.lat, lng: _data.lng});
        }
        _data.hasShow = true;
    };

    this.getDistance = function (orderPerson, options) {
        var self = this;
        if(options && 'matrix' == options.type) {
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
                {
                    origins: [new google.maps.LatLng(_data.lat, _data.lng)],
                    destinations: [new google.maps.LatLng(orderPerson.getData().lat, orderPerson.getData().lng)],
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidHighways: false,
                    avoidTolls: false
                },options.callback);
        } else {
            var data2 = orderPerson.getData();
            function deg2rad(deg) {
                return deg * (Math.PI/180);
            };

            var R = 6371; 
            var dLat = deg2rad(data2.lat - _data.lat);
            var dLon = deg2rad(data2.lng - _data.lng);
            var lat1 = deg2rad(_data.lat);
            var lat2 = deg2rad(data2.lat);

            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            return d * 1000; 
        }
    };

    this.geocodeLatLng = function (position, target) {
        geoCoder.geocode({'location': position}, function (results, status) {
            if (status === 'OK') {
                if (results[1]) {
                    if(target !== null) {
                        self.initMarker(position);
                    }
                    if (target) {
                        target.val(results[1].formatted_address);
                    }
                    _data.address = results[0].formatted_address;
                    _data.lat = position.lat();
                    _data.lng = position.lng();
                    return;
                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
            if (_data.oldPositions) {
                self.initMarker(_data.oldPositions);
            }
        });
    };

    this.geoCodeAddress = function (address) {
        var self = this;
        (function(address) {
            geoCoder.geocode({'address': address}, function (results, status) {
                if (status === 'OK') {
                    self.initMarker({lat: results[0].geometry.location.lat(), lng : results[0].geometry.location.lng()});
					_data.address = results[0].formatted_address;
                    _data.lat = results[0].geometry.location.lat();
                    _data.lng = results[0].geometry.location.lng();
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        })(address);
    };
}
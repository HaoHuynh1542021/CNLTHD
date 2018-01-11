function QuanLy() {
    var self = this;
    this._people = [];
    
    var initMap = function (options) {
        options = $.extend({}, {
            zoom: 12,
            center: {lat: 10.7588056, lng: 106.68393590000005}
        }, options);
        map = new google.maps.Map(document.getElementById('map'), options);
    };
    
    this.getPerson = function(id){
        var _person = null;
        self._people.forEach(function(person){
            if(person.getId() == id){
                _person = person;
                return false; 
            }
            return true;
        });
        return _person;
    };
    
    this.addPerson = function(person, showMap){
        this.init();
        if('KhachHang' == person.constructor.name){
			var personclickMarker = person.clickMarker;
            person.clickMarker = function(){
				personclickMarker.apply(arguments);
                var lstTaiXe = self.timTaiXe(person);
                lstTaiXe.forEach(function(taiXe, index){
                    (function(_person, _index){
                        setTimeout(function(){
                            _person.showToMap();
                        }, 100 * _index);
                    })(taiXe.person, index);
                });
            };
        }
        self._people.push(person);
        if (showMap && 'TaiXe' != person.constructor.name) {
            (function(_person){
                setTimeout(function(){
                    _person.showToMap();
                }, 100 * self._people.length);
            })(person);
        }
    };
    
    this.addTaiXe = function(data, showMap){
        this.addPerson(new TaiXe(data), showMap);
    };
    
    this.addKhachHang = function (data, showMap) {
        this.addPerson(new KhachHang(data), showMap);
    };


    
    this.tuDongGuiKhach = function(khachHang, lstTaiXe, callback){
        khachHang.timTaiXeGanNhat(lstTaiXe,callback);
    };

   
    this.timTaiXe = function(khachHang){
        var listMin = [];
        self._people.forEach(function(person){
            if(person.constructor.name == 'TaiXe'){
                if(!person.getStatus()) {
                    var distance = khachHang.getDistance(person);
                    if (listMin.length > 10) {
                        listMin.sort(function (a, b) {
                            return a.distance < b.distance;
                        });
                        if (listMin[listMin.length - 1].distance > distance) {
                            listMin[listMin.length - 1].person.hideOnMap();
                            listMin.splice(listMin.length - 1, 1)
                        }
                    } else {
                        listMin.push({distance: distance, person: person});
                    }
                } else {
                    person.hideOnMap();
                }
            }
        });
        return listMin;
    };
    
    this.removePerson = function (id) {
        self._people.forEach(function(person, index){
            if(person.getId() == id){
                person.clearMarkerData();
                self._people.splice(index, 1);
                return false;
            }
            return true;
        });
    };
    
    this.updateLocation = function(id, latlng){
        self._people.forEach(function(person, index){
            if(person.getId() == id){
                person.updatePosition(latlng);
            }
        });
    };
    
    this.init = function () {
        if(!geoCoder && !infowindow) {
            geoCoder = new google.maps.Geocoder();
            infowindow = new google.maps.InfoWindow;
        }
        if(!map) {
            initMap();
        }
    };
}
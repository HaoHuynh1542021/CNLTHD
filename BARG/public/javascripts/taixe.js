function TaiXe(data) {
    var self = this;
    this.timeTrackLocation = null;
    this.isBusy = data.isBusy;
    
    this.status = [
        'http://maps.google.com/mapfiles/kml/pal4/icon54.png',
        'http://maps.google.com/mapfiles/kml/pal2/icon47.png'
    ];
    if(data.lat && data.lng){
        data.hasChangePosition = true;
    }
    if(!data) {
        data = {};
    }
    data.draggable = false;
    if(data.isBusy) {
        data.markerImg = this.status[1];
    }else{
        data.markerImg = this.status[0];
    }
    Person.apply(this, [data]);

    this.updatePosition = function(position){
        var _data = self.getData();
        _data.lat = position.lat;
        _data.lng = position.lng;
        _data.hasChangePosition = true;
        if(_data.hasShow){
            _data.marker.setPosition(position);
        }
    };


    this.getStatus = function(){
        return this.isBusy;
    };
    
    this.setIsBusy = function(status){
        var _data = self.getData();
        if(status){
            _data.markerImg = self.status[1];
        }else{
            _data.markerImg = self.status[0];
        }
        self.isBusy = status;
        if(_data.marker){
            var img = new google.maps.MarkerImage(_data.markerImg);
            _data.marker.setIcon(img);
        }
    };
    
    this.clickMarker = function () {
        var _data = self.getData();
        window.selectedDriver = self;
        infowindow.setContent("Số điện thoại: " + _data.sdt);
        infowindow.open(map,  _data.marker);
    };
}
$.extend({}, TaiXe, new Person());

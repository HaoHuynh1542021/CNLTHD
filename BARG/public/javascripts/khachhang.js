function KhachHang(data) {
    var self = this, _default = {
        sdt: "00000000",
        target: $('#dia-chi'),
        markerImg: 'http://maps.google.com/mapfiles/ms/micons/man.png'
    };
    $.extend(true, _default, data);
    Person.apply(this, [_default]);
	
	var personClickMarker = this.clickMarker;
	this.clickMarker = function () {
        window.selectedKhachHang = self;
		personClickMarker.apply(arguments);
		self.showMe();
    };
	this.minPerson = null;
	
	this.distanceMatrixResult = function(response, status){
        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
            var distance = response.rows[0].elements[0].distance.value; 
            if(self.minPerson === null){
                self.minPerson = { distance: distance, taixe: self.lstTaiXe[self.indexTim].person};
            } else {
                if(self.minPerson.distance < distance){
                    self.minPerson = { distance: distance, taixe: self.lstTaiXe[self.indexTim].person};
                }
            }
        }
        if (self.indexTim < self.lstTaiXe.length - 1) {
            self.indexTim++;
            if (!self.lstTaiXe[self.indexTim].person.getStatus()) {
                self.getDistance(self.lstTaiXe[self.indexTim].person, {type: 'matrix', callback: self.distanceMatrixResult});
            }
        } else {
            self.callbackTimTaiXe.apply(this, [self.minPerson.taixe]);
            self.minPerson = null;
        } 
    };


	this.timTaiXeGanNhat = function(lstTaiXe, callback){
	    self.lstTaiXe = lstTaiXe;
	    self.callbackTimTaiXe = callback;
	    self.indexTim = 0;
	    self.getDistance(lstTaiXe[self.indexTim].person, {type: 'matrix', callback: self.distanceMatrixResult});
    }
}
$.extend({}, KhachHang, new Person());
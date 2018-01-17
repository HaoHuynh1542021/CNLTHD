var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var taixe = require('./routes/taixe');
var quanly = require('./routes/quanly');
var khachhang = require('./routes/khachhang');

var app = express();
var server = require('http').Server(app);

var io = require('socket.io')(server);
 
var users = [];
var drivers = [];
var persons = [];
var clientId = 1;
var cursorUser = 0;
io.on('connection', function(socket){
    if(users.indexOf(socket.id) < 0) {
        socket.on('quanly', function(data){
            socket.isQuanLy = true;
            socket.isBusy = false;
            socket.join('quanly');
            users.push({
                isQuanLy: true,
                isBusy: false,
                id: socket.id
            });
            
            drivers.forEach(function(so){
                if(so.isTaiXe) {                    
                    socket.emit('new-driver', so);
                }
            });
            
            persons.forEach(function(per){
                if(per.quanly ){
                    io.sockets.connected[socket.id].emit('have-client', per.data);
                }
            });
        });
        
        socket.on('taixe', function(data){
            socket.isTaiXe = true;
            socket.isBusy = false;
        });
        
        
        socket.on('taixe-capnhat-diachi', function(data){
            try {
                drivers.forEach(function (so) {
                    if (so.isTaiXe && so.id == socket.id) {
                        so.lat = data.lat;
                        so.lng = data.lng;
                        throw new Error("");
                    }
                });
            }catch (err){}
            io.in('quanly').emit('taixe-capnhat-diachi', data);
        });
        
        socket.on('tu-choi-khach', function(data){
             if(data.sockId){
                 if(io.sockets.connected[data.sockId]) {
                     io.sockets.connected[data.sockId].emit('tu-choi', {msg: "Không còn xe nào trống"});
                 }
             }
        });
        
        socket.on('new-driver', function(data){
            if(data.diachi){
                socket.diachi = data.diachi;
                socket.sdt = data.sdt;
                data.id = socket.id;
                data.isBusy = false;
                data.isTaiXe = true;
                socket.isTaiXe = true;
                drivers.push(data);
                io.in('quanly').emit('new-driver', data);
                socket.emit('dang-nhap-thanh-cong', data);
            }
        });

        socket.on('data', function (data) {            
            if (cursorUser > users.length - 1) {
                cursorUser = 0;
            }
            var so = users[cursorUser];
            if (so != null){
                data.quanly = so.id;
                data.id = clientId++;
                data.sockId = socket.id;
                if (io.sockets.connected[so.id] != null){
                    io.sockets.connected[so.id].emit('have-client', data);
                    persons.push({data: data, quanly: users[cursorUser].id, id: socket.id});
                    cursorUser++;
                    return false;
                }
            }
        });

        socket.on('tu-choi', function (data) {
            if(data.quanly) {
                io.sockets.connected[data.quanly].emit('tu-choi', data);
                try {
                    drivers.forEach(function (so) {
                        if (so.id == data.taixe) {
                            so.isBusy = false;
                            throw new Error("");
                        }
                    });
                }catch (err){}
            }
        });

        socket.on('chap-nhan', function (data) {
            if(data.quanly) {
                io.sockets.connected[data.quanly].emit('chap-nhan', data);
                io.sockets.connected[data.sockId].emit('chap-nhan', data);
                socket.isBusy = false;
                try {
                    drivers.forEach(function (so) {
                        if (so.isTaiXe && so.id == data.taixe) {
                            so.isBusy = false;
                            throw new Error("");
                        }
                    });
                }catch (err){}
            }
        });
        socket.on('hoan-thanh', function(data){
            if(data.quanly) {
                io.sockets.connected[data.quanly].emit('hoan-thanh', data);
            }
        });
        socket.on('submit-request', function (data) {
            try {
                drivers.forEach(function (so) {
                    if (so.isTaiXe && !so.isBusy && so.id == data.taixe) {
                        so.isBusy = true;
                        data.quanly = socket.id;
                        io.sockets.connected[so.id].emit('submit-request', data);
                        io.in('quanly').emit('cap-nhat-trang-thai', {id: data.taixe});
                        throw new Error("");
                    }
                });
            }catch (err){}
        });

        socket.on('disconnect', function(){
            if(socket.isTaiXe) {
                drivers.forEach(function (so, i) {
                    if (so.id == socket.id) {
                        drivers.splice(i, 1);
                    }
                });
                io.in('quanly').emit('dis-driver', { id: socket.id});
            }
        });
    }
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next){
    res.io = io;
    next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/taixe', taixe);
app.use('/quanly', quanly);
app.use('/khachhang', khachhang);

// catch 404 then forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app: app, server: server};
const express = require('express');

const app = express();

const server = require('http').createServer(app);

const io = require('socket.io')(server);

const port = 9000;

const path = require('path');

var users = [];
var connections = [];

var connectionStatus = function(){
    console.log('Connection status: %s socket connected', connections.length);
};

var isUserExists = function(user){
    let i = users.map(a => a.user).indexOf(user);
    if(i < 0){
        return null;
    }
    return users[i];
};

// SOCKET CONNECTION
io.on('connection', function(socket){
   
    connections.push(socket.id); 
    connectionStatus();

    socket.on('disconnect', function(){
        connections.splice(connections.indexOf(socket), 1); 
        users.splice(users.map(a => a.id).indexOf(socket.id), 1);

        io.emit('users', users);
        connectionStatus();
    });

    socket.on('new message', function(data){
        io.emit('new message', data);
    });

    socket.on('istyping', function(data){
        io.emit('istyping', data);
    });

    socket.on('users', function(data){
        let result = isUserExists(data.user);
        if(result !== null){
            return io.emit('error duplicate username', {
                id: result.id,
                user: data.user,
                clientId: data.clientId,
                message: 'The user name is already taken'
            });
        }
        users.push({
            id: socket.id,
            user: data.user,
            clientId: data.clientId
        });
        io.emit('users', users);
    });

    socket.on('get active users', function(){
        console.log('getting active users');
        io.emit('users', users);
    });

});

app.use(express.static(__dirname));

// APP SERVE STATIC FILE
app.get('/', function(req, res, next){
    res.sendFile(path.resolve(__dirname) + '/index.html');
});

server.listen(port, function(){
    console.log('Server running at port %s', port);
});

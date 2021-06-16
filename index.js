const io = require('socket.io')(3000);

let users = {};

io.on('connection', socket => {

    socket.on('new-user', name => {
        users[socket.id] = name;
        socket.emit('joined-user', users);
        socket.broadcast.emit('joined-user', users);
        console.log('new user has joined, ' + name);
    });

    socket.emit('init', 'established connection!');

    socket.on('new-message', message => {
        socket.broadcast.emit('broadcasting-message', message);
    });

    socket.on('disconnect', () => {
        console.log(users[socket.id] + " Has Disconect");
        delete users[socket.id];
        console.log(users);
        socket.broadcast.emit('joined-user', users);
    });

    socket.on('streaming', stream => {
        console.log(stream);
        socket.broadcast.emit('stream', stream);
    });

    socket.on('broadCastingFrames', frame => {
        socket.broadcast.emit('frameCast', frame);
    });

    socket.on('offer', sdp => socket.broadcast.emit('offer', sdp));

    socket.on('answer', sdp => socket.broadcast.emit('answer', sdp));

});

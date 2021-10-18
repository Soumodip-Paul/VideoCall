let peer = {};
let uids = {}
let call = {}
module.exports = (httpSrever) => {
    const { Server } = require('socket.io')
    const io = new Server(httpSrever)
    io.on('connection', socket => {
        // console.log(socket.id)

        // fires whhen client is disconnected
        socket.on('disconnect', () => {
            // console.log('disconnect',socket.id);
            if (call[socket.id] !== null && call[socket.id] !== undefined) {
                socket.to(call[socket.id]).emit('callEnded', socket.id)
                const id = uids[socket.id]
                console.log(id)
                delete call[socket.id]
                delete peer[id]
                delete uids[socket.id]
            }
        })

        // fires when uid of the user is recieved
        socket.on('uid', uid => {
            peer[uid] = socket.id;
            uids[socket.id] = uid

            // console.log('uid', uid ,socket.id)
        })

        // fires whwn a call is initiated
        socket.on('call', (uid, data) => {
            // console.log(data);
            if (peer[uid]) socket.to(peer[uid]).emit('calling', socket.id, data)
        })

        // fires when answer to the call is given 
        socket.on('answer', (uid, data) => {
            // console.log(uid,'\n',data);
            socket.to(uid).emit('answering', data)
            call[socket.id] = uid;
        })
    })
}
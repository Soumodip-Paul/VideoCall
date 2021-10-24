const { Server } = require('socket.io')
const { verify } = require('../middleware/VerifyToken')
const Caller = require('../schema/CallerSchema')
const User = require('../schema/UserSchema')

module.exports = (httpServer) => {
    const io = new Server(httpServer)
    io.on('connection', socket => {
        socket.on('disconnect', async () => {
            try {
                const call = await Caller.findOneAndDelete({ $or: [{ sender: socket.id }, { reciever: socket.id }] })
                if (call) {
                    const calle = call.sender === socket.id ? call.reciever : call.sender
                    socket.to(calle).emit('end_call', socket.id)
                }
                const user = await User.findOne({ socket_id: socket.id })
                if (user) {
                    // socket.to(user.inCallWith).emit('callEnded', socket.id)
                    await User.findByIdAndUpdate(user._id, { $set: { socket_id: null } }, { new: false })
                }
            } catch (error) {
                console.log(error)
            }
        })
        socket.on('token', async (token) => {
            try {
                const verifyToken = verify(token)
                if (!verifyToken) {
                    socket.send('You are not a valid user')
                    return
                }
                const user = await User.findByIdAndUpdate(verifyToken, { $set: { socket_id: socket.id } }, { new: false })
                if (!user) {
                    socket.send('You are not a valid user')
                    return;
                }
                else {
                    socket.send('Successfully logged in')
                }
            } catch (error) {
                console.log(error);
            }
        })
        socket.on('call', async (email, signal) => {
            try {
                const reciever = await User.findOne({ email })
                if (!reciever) {
                    socket.emit('no-user', 'No user with this email available')
                    return;
                }
                if (reciever.socket_id) socket.to(reciever.socket_id).emit('calling', socket.id, signal)

            } catch (error) {
                console.log(error)
            }
        })
        socket.on('answer', async (socket_id, data) => {
            try {
                await Caller.create({ sender: socket_id, reciever: socket.id })
                socket.to(socket_id).emit('answered', data)
            }
            catch (error) {
                console.log(error)
            }
        })
        socket.on('end_call', async () => {
            try {
                const call = await Caller.findOneAndDelete({ $or: [{ sender: socket.id }, { reciever: socket.id }] })
                if (call) {
                    const emitter = call.sender === socket.id ? call.reciever : call.sender
                    socket.to(emitter).emit('callEnded', socket.id)
                }
            } catch (error) {
                console.log(error)
            }
        })
    })
}
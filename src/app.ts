import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const port = 3001;

const app = express();
//create a http server
const server = createServer(app);
//pass the http server instance into socket.io server
const io = new Server(server);

//active clients
const clients = new Set();

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    res.sendFile(indexPath);
});

io.on('connection', (socket) => {
    //verify connection
    console.log(`user connected: ${socket.id}`);

    //add id into clients list
    clients.add(socket.id);

    //emit clients into actives event
    io.emit('actives', Array.from(clients));

    //bi-directional connection
    //listen to the chat event
    socket.on('chat', (msg: string) => {
        //emit the chat where client listen to the chat event
        io.emit('chat', { msg, socketId: socket.id });
    });

    //handle user disconnection
    socket.on('disconnect', () => {
        //remove user from the set of connected users
        clients.delete(socket.id);

        //emit updated user list to all clients
        io.emit('actives', Array.from(clients));
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
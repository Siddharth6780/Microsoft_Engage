const express = require('express')
const app = express()
const server = require('http').Server(app)
const mongoose = require('mongoose');
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const TeamList = require('./models/participants.js');

//Connecting my server with my database 

mongoose.connect('mongodb+srv://admin-siddharth:qwerty_siddharth@cluster0.avmv2.mongodb.net/TeamList?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log("Database connected!"))
    .catch(err => console.log(err));

app.use('/peerjs', peerServer);
app.set('view engine', 'ejs')
app.use(express.static('public'))


//Function to Create a random roomId

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const bodyParser = require('body-parser')
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

//Redirecting the users to the Landing Page

app.get('/', function(req, res) {
    res.render('landing_page');
});

//Calling the function to make a random room id

function getRoomName() {
    return makeid(10);
}

//Redirecting the users to the Create Room Page

app.post('/redirect_create', (req, res) => {
    res.render('create_room')
})

//Redirecting the users to the Join Room Page

app.post('/redirect_join', (req, res) => {
    res.render('join_room')
})

//Creating a room

app.post('/create', async(req, res) => {
    try {
        var room_name = getRoomName();

        //Adding the roomId to my database

        await TeamList.create({ team: room_name });
        res.redirect(`/${room_name}`)
    } catch (err) {
        throw err;
    }
})

//Redirect my users to the desired roomId

app.post('/join', async(req, res) => {
    var room_name = req.body.roomName;

    //Finding the given roomId in the database

    const team_name = await TeamList.findOne({ team: room_name });

    //If such room dosen't exist then send error else redirect to the desired roomId

    if (team_name == null) {
        res.sendStatus(404);
    } else {
        res.redirect(`/${room_name}`)
    }
})

app.get('/:room', (req, res) => {
    res.render('room', {
        roomID: req.params.room,
    })
})

//Connection with socket.io 

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        socket.on('newMessage', (message, roomId) => {
            io.to(roomId).emit('createMessage', message, roomId)
        })
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(process.env.PORT || 3000);
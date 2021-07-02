const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


function getRoomName() {
    return makeid(10);
}

const bodyParser = require('body-parser')
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', function(req, res) {
    res.render('landing_page');
});

app.post('/redirect_create', (req, res) => {
    res.render('create_room')
})

app.post('/redirect_join', (req, res) => {
    res.render('join_room')
})

app.post('/create', (req, res) => {
    var room_name = getRoomName();
    res.redirect(`/${room_name}`)
})

app.post('/join', (req, res) => {
    var room_name = req.body.roomName;
    res.redirect(`/${room_name}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {
        roomID: req.params.room,
    })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(process.env.PORT || 3000);
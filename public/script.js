const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

//Asking for the permission of the microphone and camera form the user.

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;

    //When the user will give the desired permission then it would add the user's videostream to the mainstream. 

    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    //Whenever a new user is connected it will send the message to every body in the meeting that a new participant has joined the meeting.

    socket.on('user-connected', userId => {
        $(".chatMessages").append(
            `<li>
            New paricipant joined the call.
            </li>`
        );
        connectToNewUser(userId, stream)
    })

    //Geting the meesage from the user and sent it to other users.

    let text = $(".input_msg");
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('newMessage', text.val(), ROOM_ID);
            text.val('');
        }
    });

    //Appending the send message to the other connected users. 

    socket.on("createMessage", (message, userName) => {
        $(".chatMessages").append(
            `<li>
              <b>User : </b>${message}
            </li>`
        );
    });

    //Whenever a user is disconnected it will send the message to every body in the meeting that a participant has left the meeting.

    socket.on('user-disconnected', userId => {
        $(".chatMessages").append(
            `<li>
              Sombody Left the Call
            </li>`
        );
        if (peers[userId]) peers[userId].close()
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

//Function of adding video stream of the connecting user to the present meeting.

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

//Adding the functionality to Mute/Unmute Button.

muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash after_effect" title="Unmute"></i>`;
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone" title="Mute"></i>`;
        muteButton.style.color = 'white';
        muteButton.innerHTML = html;
    }
});

//Adding the functionality to Stop/Allow Video Button.

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash after_effect" title="Allow Video"></i>`;
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video" title="Stop Video"></i>`;
        stopVideo.innerHTML = html;
        stopVideo.style.color = 'white';
    }
});

//Adding the functionality to Invite Button.

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", () => {
    prompt('Copy this Room Name to share with others\r\nCopy to clipboard: Ctrl+C', ROOM_ID);
});

////Adding the functionality to End Call Button.

const ExitButton = document.querySelector("#ExitButton");
ExitButton.addEventListener("click", () => {
    window.open('', '_self').close();
    window.location = "leave.html";
});
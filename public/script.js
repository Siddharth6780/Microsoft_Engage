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

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        $(".chatMessages").append(
            `<li>
            Sombody Joined the Call
            </li>`
        );
        connectToNewUser(userId, stream)
    })
    let text = $(".input_msg");
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            console.log(text.val());
            socket.emit('newMessage', text.val(), ROOM_ID);
            text.val('');
        }
    });

    socket.on("createMessage", (message, userName) => {
        $(".chatMessages").append(
            `<li>
              <b>User : </b>${message}
            </li>`
        );
    });
})

socket.on('user-disconnected', userId => {
    $(".chatMessages").append(
        `<li>
          Sombody Left the Call
        </li>`
    );
    if (peers[userId]) peers[userId].close()
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

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
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

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", () => {
    prompt('Copy this Room Name to share with others\r\nCopy to clipboard: Ctrl+C', ROOM_ID);
});

const ExitButton = document.querySelector("#ExitButton");
ExitButton.addEventListener("click", () => {
    window.open('', '_self').close();
    window.location = "leave.html";
});
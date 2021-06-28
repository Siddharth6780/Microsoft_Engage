let Peer = require('simple-peer');
let socket = io();
const video = document.querySelector('video');
let client = {};
let myVideoStream;
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
let name;
do {
    name = prompt('Please Enter your Name');
}
while (!name)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        socket.emit('NewClient');
        video.srcObject = stream;
        myVideoStream = stream;
        video.play();

        function initiliasestream(type) {
            let initiator_type = true;
            if (type != 'init') {
                initiator_type = false;
            }
            let peer = new Peer({ initiator: initiator_type, stream: stream, trickle: false })
            peer.on('stream', (stream) => {
                let req = document.querySelector('#peerDiv');
                let video = document.createElement('video');
                video.id = 'peerVideo';
                video.srcObject = stream;
                video.classList.add("embed-responsive-item");
                req.appendChild(video);
                video.play();
            });
            return peer;
        }

        function ExitVideo() {
            document.getElementById("peerVideo").remove();
            if (client.peer) {
                client.peer.destroy()
            }
        }

        function MakePeer() {
            client.gotAnswer = false;
            let peer = initiliasestream('init');
            peer.on('signal', (data) => {
                if (!client.gotAnwer) {
                    socket.emit('Offer', data);
                }
            });
            client.peer = peer;
        }

        function FrontAnswer(offer) {
            let peer = initiliasestream('notInit');
            peer.on('signal', (data) => {
                socket.emit('Answer', data);
            });
            peer.signal(offer);
            client.peer = peer;
        }

        function SignalAnswer(answer) {
            client.gotAnswer = true;
            let peer = client.peer;
            peer.signal(answer);
        }

        socket.on('BackOffer', FrontAnswer);
        socket.on('BackAnswer', SignalAnswer);
        socket.on('SessionActive', () => {
            document.write('Session Active. Please come back later')
        });
        socket.on('CreatePeer', MakePeer);
        socket.on('ExitVideo', ExitVideo);
    })
    .catch(err => document.write("Please Give Permission of Microphone and Camera"))

muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash after_effect"></i>`;
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.style.color = 'white';
        muteButton.innerHTML = html;
    }
});

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash after_effect"></i>`;
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.innerHTML = html;
        stopVideo.style.color = 'white';
    }
});

const inviteButton = document.querySelector("#inviteButton");

inviteButton.addEventListener("click", () => {
    prompt('Copy this Link to share with others', window.location.href);
});

const ExitButton = document.querySelector("#ExitButton");

ExitButton.addEventListener("click", () => {
    window.open('', '_self').close();
    window.location = "leave.html";
});
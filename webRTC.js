
const socket = io("http://localhost:3000");

const boxStream = document.getElementById('box-stream');
const boxUsers = document.getElementById('box-users');


socket.emit('new-user', name);

socket.on('joined-user', users => {
    boxUsers.innerHTML = "";
    for (key in users) {
        renderUsersEL(users[key]);
    }
});

socket.on('user-active', users => {
    boxUsers.innerHTML = "";
    for (key in users) {
        renderUsersEL(users[key]);
    }
});

function renderUsersEL(user) {
    let nel = document.createElement('li');
    if (user == name) user += " - active";
    nel.innerHTML = user;
    boxUsers.appendChild(nel);
}


document.getElementById('stream-btn').addEventListener('click', broadcast);
let isClient = false;
const localSDP = document.getElementById('localSDP');
const clientSDP = document.getElementById('clientSDP');
const peerConnection = new RTCPeerConnection();


function broadcast() {
    isClient = false;
    const videoELement = document.createElement('video');
    videoELement.muted = true;

    let media = navigator.mediaDevices.getUserMedia({ 'video': true, 'audio': true });
    media.then(stream => {
        videoELement.srcObject = stream;
        peerConnection.addStream(stream);
        videoELement.play();
        boxStream.appendChild(videoELement);
        peerConnection.createOffer()
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                localSDP.value = JSON.stringify(peerConnection.localDescription);
            });
    });
}



clientSDP.addEventListener('change', async e => {
    if (isClient == true) return;

    peerConnection.setRemoteDescription(JSON.parse(clientSDP.value))
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            if (localSDP.value != "") return;
            localSDP.value = JSON.stringify(peerConnection.localDescription);
        });

    peerConnection.onaddstream = event => {
        const videoELement = document.createElement('video');
        videoELement.muted = true;
        videoELement.srcObject = event.stream;
        videoELement.play();
        boxStream.append(videoELement);
    };
});
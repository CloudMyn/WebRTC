
// http://192.168.43.135:5500/
const socket = io('http://192.168.43.135:3000');
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




const boxStream = document.getElementById('box-stream');
const streamBTN = document.getElementById('stream-btn');
const peerConnection = new RTCPeerConnection();

streamBTN.addEventListener('click', startStream);

// Browser `A` start stream
function startStream() {
    let video = document.createElement('video');
    video.muted = true;

    let media = navigator.mediaDevices.getUserMedia({
        'video': true,
        'audio': true
    });

    media.then(async stream => {
        video.srcObject = stream;
        video.play();
        // Browser `A` will add media stream into a peer
        peerConnection.addStream(stream);
        // Browser `A` will creating SDP That contained all information of stream media
        await peerConnection.createOffer().then(sdp => peerConnection.setLocalDescription(sdp));
        // And broadcasting into connected browser `B`
        socket.emit('offer', JSON.stringify(peerConnection.localDescription));
        boxStream.appendChild(video);
    });
}


// in browser `B` wll accepting offer from browser `A`
socket.on('offer', message => {
    // SDP that has received wlll be set into
    // RemoteDescription inside PeerConnection in
    // browser `B` and than peerConnection also 
    // procceding SDP to send back in browser `A`
    console.log(JSON.parse(message));
    peerConnection.setRemoteDescription(JSON.parse(message))
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => socket.emit('answer', JSON.stringify(peerConnection.localDescription)));


    // in process to create and sendback the SDP,
    // peerConnection in browser `B` wll receive a 
    // stream that have broacasting by the browser `A`
    peerConnection.onaddstream = e => {
        const videoELement = document.createElement('video');
        videoELement.muted = true;
        videoELement.srcObject = event.stream;
        videoELement.play();
        boxStream.append(videoELement);
    };
});

// After getting the answere from browser `B`
// peerConnection in browser `A` wll set
// remote description from browser `B` and
// establish comunication p2p
socket.on('answer', async message => {
    peerConnection.setRemoteDescription(JSON.parse(message));
});
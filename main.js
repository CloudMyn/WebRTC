
const socket = io('http://localhost:3000');
const formMessage = document.getElementById('box-form');
const boxMessage = document.getElementById('box-msg');
const inputMessage = document.getElementById('message');
const boxUsers = document.getElementById('box-users');


socket.emit('new-user', name);
console.log(name);

const url = new URL(window.location.href);
const val = url.searchParams.get('msg');
console.log(val);

const renderMessage = (msg) => {
    let nel = document.createElement('li');
    boxMessage.appendChild(nel);
    nel.innerHTML = msg;
};

socket.on('broadcasting-message', renderMessage);

// inputMessage.addEventListener('input', e => sendMsg());

formMessage.addEventListener('submit', e => {
    e.preventDefault();
    sendMsg();
});

function sendMsg() {
    const value = inputMessage.value;
    if (value == "") return;
    socket.emit('new-message', value);
    renderMessage(value);
}

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
const btnStream = document.getElementById('stream-btn');

const image = document.createElement('img');
boxStream.appendChild(image);

btnStream.addEventListener('click', () => {
    const vdEl = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    boxStream.appendChild(vdEl);
    vdEl.muted = true;
    navigator.mediaDevices.getUserMedia({
        video: true,
    }).then(stream => {
        addVideoStream(vdEl, stream);
        const video = document.querySelector('video');

        setInterval(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL("image/jpeg", 10);
            socket.emit('broadCastingFrames', imageData);
        }, 100);
    });
    // broadCast();
});

function broadCast() {
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    navigator.mediaDevices.getUserMedia({ 'video': true }).then(stream => {
        video.srcObject = stream;

        setInterval(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL("image/jpeg", 0.9);
            socket.emit('broadCastingFrames', imageData);
            console.log(' - sended frame');
        }, 1000);
    });;
}

socket.on('frameCast', frame => {
    watch(frame);
})

function watch(frame) {
    const image = document.querySelector('img');
    image.src = frame;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });
    socket.emit('streaming', { 'stream': stream });
    boxStream.appendChild(video);
}

socket.on('stream', stream => {
    console.log(stream);
});
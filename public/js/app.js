const socket = io("/");

//elements
const messageForm = document.querySelector(".msg-form");
const messageInput = document.querySelector("#msg-input");
const messages = document.querySelector("#messages");
const audioCall = document.querySelector("#call");
const videoCall = document.querySelector("#video");
const backBtn = document.querySelector("#back");
const callingDiv = document.querySelector(".calling");
const progressCall = document.querySelector("#progressCall");
const videoGrid = document.querySelector(".video-grid");
const onlineIcon = document.querySelectorAll("#online-icon");
const friendIdHidden = document.querySelectorAll("#friend-id");
const userIdHidden = document.querySelector("#userID");
const acceptBtn = document.querySelector("#accept-call");
const rejectBtn = document.querySelector("#reject-call");
const cancelCall = document.querySelector(".disconnect");
const incomingCall = document.querySelector(".incoming-call");
const callerCreds = document.querySelector(".caller-creds");
const callerContent = document.querySelector("#caller-content");
const path = location.pathname.split("/");

//appendVideo
const appendVideo = (video, muted, stream) => {
  video.srcObject = stream;
  video.muted = muted;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.appendChild(video);
};

//button manipulation
const changeButtons = () => {
  audioCall.classList.add("on-call");
  videoCall.classList.add("on-call");
  backBtn.classList.remove("on-call");
  progressCall.classList.remove("on-call");
};

//event listeners
const clickButtons = (call) => {
  progressCall.addEventListener("click", () => {
    call.close();
    location.reload();
  });
  backBtn.addEventListener("click", () => {
    messages.classList.remove("on-call");
    backBtn.classList.add("on-call");
  });
};

//making video call using peer js
if (path[2] === "chat") {
  const peerID = userIdHidden.value;
  const peer = new Peer(peerID);

  peer.on("open", (id) => {
    console.log("your peer id is: " + id);
  });

  videoCall.addEventListener("click", async () => {
    messages.classList.add("on-call");
    callingDiv.classList.remove("on-call");
    console.log("making a call...");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    //making a call
    const call = peer.call(path[3], stream, {
      metadata: { callerId: peer.id, divCall: callerCreds.innerHTML },
    });

    //cancelling the call
    cancelCall.addEventListener("click", () => {
      call.close();
      messages.classList.remove("on-call");
      callingDiv.classList.add("on-call");
      location.reload();
    });

    //listening to answered call
    const peerVideo = document.createElement("video");
    call.on("stream", (stream) => {
      callingDiv.classList.add("on-call");
      videoGrid.classList.remove("on-call");
      changeButtons();
      appendVideo(peerVideo, false, stream);
      clickButtons(call);
    });
  });

  //incoming call
  peer.on("call", (call) => {
    console.log("incoming call");
    incomingCall.classList.remove("on-call");
    callerContent.innerHTML = call.metadata.divCall;
    const video = document.createElement("video");
    call.on("stream", (stream) => {
      messages.classList.add("on-call");
      videoGrid.classList.remove("on-call");
      changeButtons();
      appendVideo(video, true, stream);
      clickButtons(call);
    });

    //accept the call
    acceptBtn.addEventListener("click", async () => {
      incomingCall.classList.add("on-call");

      const myStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      call.answer(myStream);
    });

    //reject the call
    rejectBtn.addEventListener("click", () => {
      call.close();
      incomingCall.classList.add("on-call");
      messages.classList.remove("on-call");
      videoGrid.classList.add("on-call");
    });
  });

  peer.on("error", (err) => {
    console.log(err);
  });
}

//functions
const appendMessages = (message, position) => {
  const div = document.createElement("div");
  div.classList.add(`message`);
  const p = document.createElement("p");
  p.classList.add(position);
  p.innerText = message;
  div.appendChild(p);
  messages.appendChild(div);
};

//socket events
//checking online
for (let index = 0; index < friendIdHidden.length; index++) {
  const friendId = friendIdHidden[index].value;
  socket.on("clientId", (clientId) => {
    if (clientId === friendId) {
      onlineIcon[index].classList.remove("red");
      onlineIcon[index].innerText = "online";
    }
  });

  socket.on("offlineUser", (userId) => {
    if (userId === friendId) {
      onlineIcon[index].classList.add("red");
      onlineIcon[index].innerText = "offline";
    }
  });
}

//checking (reading) messages
socket.on("sentMessage", (message) => {
  appendMessages(message, "left");
});

//broadcasting message
if (messageForm) {
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("message", messageInput.value, () => {
      console.log("sent");
    });

    appendMessages(messageInput.value, "right");
    messageInput.value = "";
  });
}

// specify the room i.e. friend
fetch("/friends/userId").then((res) =>
  res.json().then((data) => {
    const id = data.id;
    socket.emit("userId", id);

    const userId = parseInt(id.replace(/\D/g, ""));
    if (path[2] === "chat") {
      const friendId = parseInt(
        location.pathname.split("/")[3].replace(/\D/g, "")
      );
      const roomId = friendId + userId;
      socket.emit("join", roomId, (online) => {
        appendMessages(`I'm ${online}`, "left");
      });
    }
  })
);

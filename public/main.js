const imageContainerDiv = document.getElementById("imagecontainer");
let latestImages = [{timestamp: 0}];
let maxTimestamp = Date.now();
let timerID;
let attempts = 0;
const maxAttempts = 2;




// Prevents the form from submitting without an image being selected first
function validateForm(){
    let filename = document.getElementById('file').value;
    if (filename === ""){
        setMessage("Please Choose an Image to Upload");
        return false;
    }
}

// Displays message on main page
function setMessage(str){
    let messageEl = document.getElementById("message");
    messageEl.innerHTML = str;
}

// Adds new image to the top of the main page
function prependImage(anImg) {
    latestImages.push(anImg);
    imageContainerDiv.innerHTML =
      `<div><img src="uploads/${anImg}"></div>` + imageContainerDiv.innerHTML;
}

// Adds the messages to the messages div when the sender is clicked
function appendMessages(msgs) {
    for (let msg in msgs) {
    PLACEHOLDER.innerHTML +=
      `<div class="message"><strong>${msg.name}</strong><br>${msg.message}</div>`;
    }
}

// 
// Should create new Sender divs that also allows you to draw their messages on click
// Requires changing the placeholder to the name of the div you're appending to
function appendChatWindows(message) {
    const newSender = document.createElement('div');
    const senderMessages = document.createElement('div');
    newSender.id = message.name
    let fromUser = document.getElementById('PLACEHOLDER');
    let messageWindow = document.getElementById('PLACEHOLDER');
    fromUser.addEventListener('click', getMessages);

    if(!document.getElementById(message.name)) {
    fromUser.appendChild(newSender);
    }
    if(!document.getElementById(`${message.name}Message`)) {
        senderMessages.id = `${message.name}Messages`;
        messageWindow.appendChild(senderMessages);
    }
}

//  Gets the newest images loaded on the server after a specified timestamp
function fetchImages() {
    const postRequestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({after: maxTimestamp}),
    }

    fetch('/latest', postRequestOptions)
    .then(response => response.json())
    .then(data => {
        // Reset attempts so that we can keep track of two successive failed attempts  
        attempts = 0;   
        // Loop through images and display 
        for(let i = 0; i < data.images.length; i++){ 
           let anImg = data.images[i];
           prependImage(anImg);
        }
        // Set maxTimestamp 
        // timestamp is 0 when no new images are returned 
        if (data.timestamp !== 0) {
            maxTimestamp = data.timestamp;
        }  
        // Poll for new images every 5 seconds
        timerID = setTimeout(fetchImages, 5000);
    })
    .catch(error => {
        console.log("An error has occurred when attempting to Fetch:", error);
        attempts++;
        if (attempts < maxAttempts){
            timerID = setTimeout(fetchImages, 5000);
        } else {
            setMessage("Connection Lost");
            clearTimeout(timerID);
        }        
    })
}

// Creates sender divs in chat
function fetchMessages() {
    fetch('/messages')
        .then(response => response.json())
        .then(data => {
            for (let message in data.messages) {
                appendChatSender(message);
                appendMessages(messages);
            }
        })
}

fetchImages();
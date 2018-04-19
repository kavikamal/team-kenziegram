const imageContainerDiv = document.getElementById("imagecontainer");
let latestImages = [{timestamp: 0}];
let maxTimestamp = Date.now();
let timerID;

function validateForm(){
    let filename = document.getElementById('file').value;
    if (filename === ""){
        setMessage("Please Choose an Image to Upload");
        return false;
    }
}

function setMessage(str){
    let messageEl = document.getElementById("message");
    messageEl.innerHTML = str;
}


function appendImage(anImg) {
    latestImages.push(anImg);
    imageContainerDiv.innerHTML =
      `<div><img src="uploads/${anImg}"></div>` + imageContainerDiv.innerHTML;
}

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
        // Loop through images and display 
        for(let i = 0; i < data.images.length; i++){ 
           let anImg = data.images[i];
           appendImage(anImg);
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
        console.log("An error has occurred when attempting to Fetch:", error)
        // alert("In Catch: Connection Failure 1!");
        // try { 
        //     fetchImages();
        // } catch(err){
        //     alert("Second attempt: Connection Failure!");
        // }
     
        
    })

}

fetchImages();
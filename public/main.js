const imageContainerDiv = document.getElementById("imagecontainer");
let latestImages = [{timestamp: 0}];
let maxTimestamp = Date.now();

function appendImage(anImg) {
    latestImages.push(anImg);
    imageContainerDiv.innerHTML =
      `<div><img src="uploads/${anImg}"></div>` + imageContainerDiv.innerHTML;
}

function fetchImages() {

    console.log("In FetchImages: maxTimestamp", maxTimestamp);

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
        console.log("Fetching latest image from server - data", data);
        console.log("data.images.length", data.images.length);
        // Loop through images and display 
        for(let i = 0; i < data.images.length; i++){ 
           let anImg = data.images[i];
           appendImage(anImg);
        }
        // Set maxTimestamp
        if (data.timestamp !== 0) {
            maxTimestamp = data.timestamp;
        }
        
        // Poll for new images every 5 seconds
        setTimeout(fetchImages, 5000);
    })
    .catch(error => {
        console.log("An error has occurred when attempting to Fetch:", error)
    })

}

fetchImages();
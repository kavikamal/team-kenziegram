const express = require('express');
const multer = require('multer');
const fs = require('fs');
const upload = multer({dest: 'public/uploads/'});
const port = 3000;
const app = express();

const path = './public/uploads';
const items = [];
let maxTimestamp = 0;


app.use(express.static('public'));
app.use(express.json());
app.set('views', './views');
app.set('view engine', 'pug');

// Renders the main page along with all the images
app.get('/', function (req, res) {  
    fs.readdir(path, function(err, items) {
        console.log(items);    
        res.render('indexget.pug',{title: 'KenzieGram', arrayofimages: items});
    });
})

// Gets the latest images uploaded after a client-specified timestamp
app.post('/latest', function (req, res, next) {
    const latestImages = [];
    const after = req.body.after;
    
    fs.readdir(path, function(err, items) {
        // Loops through array of images to check if the modified time of each image
        // is greater than the client specified timestamp that was passed in
        // If so, store the new image(s) to be passed back along with the latest timestamp of all images
        for (let i=0; i<items.length; i++){
            let modified = fs.statSync(path + '/' + items[i]).mtimeMs;
            if (modified > after){
                latestImages.push(items[i]);
                maxTimestamp = modified > maxTimestamp ? modified : maxTimestamp;
            }
        }
        res.send({images: latestImages, timestamp: maxTimestamp});
    });
    
})

// Uploads a new images and renders the uploaded page with the new image
app.post('/upload', upload.single('myFile'), function (req, res, next) {
    // req.file is the `myFile` file
    // req.body will hold the text fields, if there were any
    items.push(req.file.filename);
    res.render('indexpost.pug',{title:'KenzieGram',imagename: req.file.filename});
  })

app.listen(port);


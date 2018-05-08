const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');   
const upload = multer({dest: 'public/uploads/'});

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', './views');
app.set('view engine', 'pug');

const dbName = 'xforcekenziegram';
const DB_USER = 'admin';
const DB_PASSWORD = 'admin';
const DB_URI = 'ds217350.mlab.com:17350';
const PORT = process.env.PORT || 3000;
const path = './public/uploads';
const items = [];
let maxTimestamp = 0;

// Connection to mongoDB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

// Define Schemas 
const Schema = mongoose.Schema;
let userSchema = new Schema({
        name: String,
        profilePic: String,
        messages: [{
            name: String,
            message: String,
            timestamp: Number,
        }],
        posts: [{
            image: String,
            timestamp: Number,
            user: String,
            caption: String,
            comments: [String],
        }]
});
let feedSchema = new Schema({
    posts: [String]
});

// Compile User and Feed models from the schemas
var User = mongoose.model('User', userSchema);
var Feed = mongoose.model('Feed', feedSchema);

// Renders the main page along with all the images
app.get('/', function (req, res) {  
    fs.readdir(path, function(err, items) {   
        res.render('indexget.pug',{title: 'KenzieGram', arrayofimages: items});
    });
})

app.get('/register', (req, res) => {
    res.render('signup')
})

app.get('/chat', (req, res) => {
    res.render('chat')
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
    User.find({ name: "admin" })
    res.render('indexpost.pug',{title:'KenzieGram',imagename: req.file.filename});
  })

app.post('/createProfile', function (req, res) {
    const instance = new User({
        name: "user",
        profilePic: "",
        messages: [{
            name: "",
            message: "",
            timestamp: 0,
        }],
        posts: [{
            image: "String",
            timestamp: 0,
            user: "",
            caption: "",
            comments: "",
        }]
});

    instance.save()
        .then(instance => res.send())
        res.render('indexget.pug',{title: 'KenzieGram', arrayofimages: items});

});

app.listen(PORT, () => {
    mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`);
    // mongoose.connect('mongodb://localhost/xforcekenzigram')
    console.log(`listening at port ${PORT}`);
})


const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');   
const upload = multer({dest: 'public/uploads/'});

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.set('views', './views');
app.set('view engine', 'pug');

const dbName = 'xforce';
const DB_USER = 'admin';
const DB_PASSWORD = 'admin';
const DB_URI = 'ds121268.mlab.com:21268';


const PORT = process.env.PORT || 3000;

const path = './public/uploads';
const items = [];
let maxTimestamp = 0;

// Connection to mongoDB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

let username;

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
            comments: Array,
        }],
    
});


let feedSchema = new Schema({
    posts: Array
});

// Compile User and Feed models from the schemas
var User = mongoose.model('User', userSchema);
var Feed = mongoose.model('Feed', feedSchema);



app.post('/createProfile', function (req, res) {
    const requestedUser = new User({
        name: req.body.name,
        // profilePic: req.body.profilePic

    });

    username = req.body.name;

    requestedUser.save()
        .then(requestedUser => {
            console.log(`Saved ${requestedUser} to database`)
            // check if user already exists, if not, then >>
            
            res.render('indexget.pug',{title: 'KenzieGram', arrayofimages: items, username});
            
            // if user exists, then do res.send(new Error("pick a new handle"))
        })
        .catch(error => {
            console.log(error)
            res.send(error)
        })

    

});

// Renders the main page along with all the images

app.get('/', function (req, res) {  
    fs.readdir(path, function(err, items) {
        
           
        res.render('indexget.pug',{title: 'KenzieGram', arrayofimages: items, username});
    });
})

app.get('/register', function (req, res) {
    res.render('signup.pug');
});



// Gets the latest images uploaded after a client-specified timestamp
app.post('/latest', function (req, res, next) {
    const latestImages = [];
    const after = req.body.after;

    
    
    db.collection('users').find({ 'name': req.body.name })
        .then(user => console.log(user.posts))

         // Loops through array of images to check if the modified time of each image
        // is greater than the client specified timestamp that was passed in
        // If so, store the new image(s) to be passed back along with the latest timestamp of all images




        // for (let i=0; i<items.length; i++){
        //     let modified = fs.statSync(path + '/' + items[i]).mtimeMs;
        //     if (modified > after){
        //         latestImages.push(items[i]);
        //         maxTimestamp = modified > maxTimestamp ? modified : maxTimestamp;
        //     }
        // }
        // res.send({images: latestImages, timestamp: maxTimestamp});
    
    
});

// Uploads a new images and renders the uploaded page with the new image
app.post('/upload', upload.single('myFile'), function (req, res, next) {

    items.push(req.file.filename);

    let userToSearch = req.body.name;
    // console.log(userToSearch)

    db.collection('users').findOneAndUpdate({ 'name': userToSearch }, { $push: { posts: req.file.filename} })
    // .then(user => console.log(user))

    
    
    res.render('indexpost.pug',{title:'KenzieGram',imagename: req.file.filename});
  })

app.listen(PORT, () => {
    mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`);
    console.log(`listening at port ${PORT}`);
})

// app.listen(PORT, () => {
//     mongoose.connect(`mongodb://localhost/xforce`);
//     console.log(`listening at port ${PORT}`);
// });


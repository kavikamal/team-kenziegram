const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const upload = multer({
    dest: 'public/uploads/'
});
const profilePicUpload = multer({
    dest: 'public/profilePictures/'
})
const gm = require('gm').subClass({
    imageMagick: true
});

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.set('views', './views');
app.set('view engine', 'pug');

const dbName = 'xforcekenziegram';
const DB_USER = 'admin';
const DB_PASSWORD = 'admin';
const DB_URI = 'ds217350.mlab.com:17350';
const PORT = process.env.PORT || 3000;
const path = './public/uploads';
const profilePicPath = './public/profilePictures'
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

// Renders the main page along with all the images

app.get('/', function (req, res) {
    fs.readdir(path, function (err, items) {
        res.render('indexget.pug', {
            title: 'KenzieGram',
            arrayofimages: items,
            username
        });
    });
})


app.get('/register', function (req, res) {
    res.render('signup.pug');
});


app.get('/chat', (req, res) => {
    res.render('chat')
})

app.get('/post', (req, res) => {
    res.render('indexpost')
})



// Uploads a new images and renders the uploaded page with the new image
app.post('/upload', upload.single('myFile'), function (req, res, next) {
    // req.file is the `myFile` file
    // req.body will hold the text fields, if there were any
    // gm starts the graphicsMagick package that edits our uploaded images

    // do we still need this???
    items.push(req.file.filename);

    let userToSearch = req.body.name;
    db.collection('users').findOneAndUpdate({
        'name': userToSearch
    }, {
        $push: {
            posts: req.file.filename
        }
    })

    gm(`${path}/${req.file.filename}`)
        .resize(300, 300, '!')
        .noProfile()
        .compress("JPEG")
        // Resizes to 300x300 with no regard for aspect ratio, removes EXIF data, then compresses the file to . JPEG
        .write(`${path}/${req.file.filename}`, function (err) {
            // This creates the new file with our modifications
            if (!err) console.log('Image Resized!')

            // This deletes the original file
            console.log('Orginal file was Deleted')

            res.render('indexpost.pug', {
                title: 'KenzieGram',
                imagename: `resized${req.file.filename}`
            });
        })
    console.log(req.file.filename)
})



app.post('/createProfile', profilePicUpload.single('profilePic'), function (req, res) {
    // The GraphicsMagick module creates a thumbnail image from the uploaded profile picture
    console.log(req.body.profilePic)
    gm(`${profilePicPath}/${req.body.profilePic}`)
        .resize(25, 25, '!')
        .noProfile()
        .compress('JPEG')
        .quality(85)
        .write(`${profilePicPath}/${req.body.profilePic}`, function (err) {
            if (!err) console.log('Image Resized!')
            console.log(err)

            const instance = new User({
                name: req.body.name,
                profilePic: `${profilePicPath}/${req.body.profilePic}`,
                messages: [],
                posts: []
            });

            username = req.body.name;

            console.log(req.body);
            console.log("req.body.profilepic: ", req.body.profilePic);

            instance.save()
                .then(instance => res.send())
            res.render('indexget.pug', {
                title: 'KenzieGram',
                arrayofimages: items,
                username
            });

        })
});

// Gets the latest images uploaded after a client-specified timestamp
app.post('/latest', function (req, res, next) {
    const latestImages = [];
    const after = req.body.after;

    // db.collection('users').find({
    //         'name': req.body.name
    //     })
    //     .then(user => console.log(user.posts))

    // Loops through array of images to check if the modified time of each image
    // is greater than the client specified timestamp that was passed in
    // If so, store the new image(s) to be passed back along with the latest timestamp of all images
    fs.readdir(path, function (err, items) {
        for (let i = 0; i < items.length; i++) {
            let modified = fs.statSync(path + '/' + items[i]).mtimeMs;
            if (modified > after) {
                latestImages.push(items[i]);
                maxTimestamp = modified > maxTimestamp ? modified : maxTimestamp;
            }
        }
        res.send({
            images: latestImages,
            timestamp: maxTimestamp
        });
    });
});

app.listen(PORT, () => {
    // mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`);
    mongoose.connect('mongodb://localhost/xforcekenzigram')
    console.log(`listening at port ${PORT}`);
})
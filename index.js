const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt-nodejs');
let userName;

//const profilePicUpload = multer({ dest: 'public/profilepictures/'})
//User can upload image types - (jpg|jpeg|png|gif)
var storage = multer.diskStorage({
  
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/') 
    },
    filename: (req, file, cb) => {
      if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null,Date.now()  + '-' + file.originalname)
    }
  });
const upload = multer({storage: storage});

// const upload = multer({ dest: 'public/uploads/' });

const gm = require('gm').subClass({ imageMagick: true });
// password authentication
const expressValidator = require('express-validator');
const expressSession = require('express-session');

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// password authentication
app.use(expressValidator());
app.use(expressSession({secret: 'pedro', saveUninitialized: false, resave: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 

//
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.set('views', './views');
app.set('view engine', 'pug');

const dbName = 'kenziegram';
const DB_USER = 'admin';
const DB_PASSWORD = 'admin';
const DB_URI = 'ds053428.mlab.com:53428';
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
    password: String,
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
    }]

});
let feedSchema = new Schema({
    posts: Array
});

// Compile User and Feed models from the schemas
var User = mongoose.model('User', userSchema);
var Feed = mongoose.model('Feed', feedSchema);

// Renders the main page along with all the images
app.get('/', function (req, res) {  
    fs.readdir(path, function(err, items) {   
        res.render('signup',{title: 'KenzieGram'});

    });
})

app.get('/register', (req, res) => {
    res.render('signup', { title: 'Sign-up', success: req.session.success, errors: req.session.errors});
    req.session.errors = null;
})

app.get('/chat', (req, res) => {
    res.render('chat')
})

app.get('/post', (req, res) => {
    res.render('post')
})

// Gets the latest images uploaded after a client-specified timestamp
app.post('/latest', function (req, res, next) {
    const latestImages = [];
    const after = req.body.after;

    fs.readdir(path, function (err, items) {
        // Loops through array of images to check if the modified time of each image
        // is greater than the client specified timestamp that was passed in
        // If so, store the new image(s) to be passed back along with the latest timestamp of all images
        for (let i = 0; i < items.length; i++) {
            let modified = fs.statSync(path + '/' + items[i]).mtimeMs;
            if (modified > after) {
                latestImages.push(items[i]);
                maxTimestamp = modified > maxTimestamp ? modified : maxTimestamp;
            }
        }
        res.send({ images: latestImages, timestamp: maxTimestamp });
    });

})

// Uploads a new images and renders the uploaded page with the new image
app.post('/upload', upload.single('myFile'), function (req, res, next) {
    
    // req.file is the `myFile` file
    // req.body will hold the text fields, if there were any
    // gm starts the graphicsMagick package that edits our uploaded images
    gm(`${path}/${req.file.filename}`)
        .resize(300, 300, '!')
        .noProfile()
        .compress("JPEG")
        // Resizes to 300x300 with no regard for aspect ratio, removes EXIF data, then compresses the file to . JPEG
        .write(`${path}/${req.file.filename}`, function (err) {
            // This creates the new file with our modifications
            if (!err) console.log('Image Resized!')
                res.render('photos.pug', { title: 'KenzieGram', imagename: `resized${req.file.filename}` });
            })
            let post = {
                image: req.file.filename,
                timestamp: Date.now,
                user: req.body.name,
                caption: req.body.caption,
                comments: [],
            };
            db.collection('users').findOneAndUpdate({"name": userName }, {$push: {posts: post} })   
        
        });
      
app.post('/createProfile', upload.single('profilePic'), function (req, res, next) {
    // The GraphicsMagick module creates a thumbnail image from the uploaded profile picture
    req.check('name', 'Invalid profile name').isLength({min: 4}).notEmpty();
    req.check('password', 'Password is Invalid').isLength({min: 4}).notEmpty()
    req.check('password', 'Passwords Do Not Match').equals(req.body.confirmPassword)
    const errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        req.session.success = false;
        console.log(errors);
        for (error of errors) {
            console.log(error.msg);
        }
    } else {
        req.session.success = true;
    }
    if (req.session.success === true) {
    userName = req.body.name;
    gm(`${path}/${req.file.filename}`)
        .resize(25, 25, '!')
        .noProfile()
        .compress('JPEG')
        .quality(85)
        .write(`${path}/${req.file.filename}`, function (err) {
            if (!err) console.log('Profile Pic Resized!')
            console.log(err)
            const instance = new User({
                name: req.body.name,
                profilePic: `${req.file.filename}`,
                messages: [],
                posts: []
            });

            instance.save()
                .then(instance => res.send())
            res.render('photos.pug', { title: 'KenzieGram', arrayofimages: items, userName: req.body.name });

        });
    }
});


// Endpoint for login instead of creating a new profile
app.post('/login', (req, res) => {
    console.log(req.body.name);
    userName = req.body.name;
    db.collection('users').findOne({ 'name' : userName})
    .then((user) =>{
        res.render('photos', { title: 'KenzieGram', posts: user.posts, userName})
    })
    .catch((err) =>{
        res.render('photos', { title: 'KenzieGram', userName})
    })
})

app.listen(PORT, () => {
    mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`);
    // mongoose.connect('mongodb://localhost/xforcekenziegram')
    console.log(`listening at port ${PORT}`);
})


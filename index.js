const express = require('express');
const multer = require('multer');
const fs = require('fs');
const upload = multer({dest: 'public/uploads/'});
const port = 3000;
const app = express();

const items = [];

app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function (req, res) {

    const path = './public/uploads';
    fs.readdir(path, function(err, items) {
        console.log(items);
        res.render('indexget.pug',{title: 'KenzieGram', arrayofimages: items});
    });
})

app.post('/upload', upload.single('myFile'), function (req, res, next) {
    // req.file is the `myFile` file
    // req.body will hold the text fields, if there were any
    console.log("Uploaded: " + req.file.filename);
    items.push(req.file.filename);
    res.render('indexpost.pug',{title:'KenzieGram',imagename: req.file.filename});
  })


app.listen(port);


const express = require('express');
const multer = require('multer');
const fs = require('fs');
const upload = multer({dest: 'public/uploads/'});
const port = 3000;
const app = express();

const path = './public/uploads';
const items = [];


app.use(express.static('public'));
app.use(express.json());
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function (req, res) {  
    fs.readdir(path, function(err, items) {
        console.log(items);    
        res.render('indexget.pug',{title: 'KenzieGram', arrayofimages: items});
    });
})

app.post('/latest', function (req, res, next) {
    const latestImages = [];
    const after = req.body.after;
    let maxTimestamp = 0;
    fs.readdir(path, function(err, items) {
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

app.post('/upload', upload.single('myFile'), function (req, res, next) {
    // req.file is the `myFile` file
    // req.body will hold the text fields, if there were any
    items.push(req.file.filename);
    res.render('indexpost.pug',{title:'KenzieGram',imagename: req.file.filename});
  })

app.listen(port);


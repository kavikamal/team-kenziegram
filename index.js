const express = require('express');
const multer = require('multer');
const fs = require('fs');
const upload = multer({dest: 'public/uploads/'});
const port = 3000;
const app = express();

const items = [];

app.use(express.static('public'));

app.get('/', function (req, res) {

    const path = './public/uploads';
    fs.readdir(path, function(err, items) {
	    console.log(items);
	    res.send(`<!DOCTYPE html>
        <html lang="en">
            <head>
                <title>KenzieGram</title>
            </head>
            <body style="margin:0 auto; text-align:center;">
                <header style="height:60px; background-color:#6495ed;">
                    <h1 style="color:#ffffff; font-size:50px; font-family:fantasy;">KenzieGram</h1>
                </header>
                <form style="margin-top:20px" method="post" action="http://localhost:3000/upload" enctype="multipart/form-data">
                    <div>
                        <label for="file">Choose a File:</label>
                        <input type="file" id="file" name="myFile">
                        <button>Upload</button>
                    </div>
                </form>
                <div style="margin-top:40px">
                    ${items.join("#").split("#").map((item) => `
                    <div><img src="uploads/${item}"></div>
                    `).join('')}
                </div>
            </body> 
            </html>`  
        );
    });
})

app.post('/upload', upload.single('myFile'), function (req, res, next) {
    // req.file is the `myFile` file
    // req.body will hold the text fields, if there were any
    console.log("Uploaded: " + req.file.filename);
    items.push(req.file.filename);
    res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <title>KenzieGram</title>
            </head>
            <body style="margin:0 auto; text-align:center;">
                <header style="height:60px; background-color:#6495ed;">
                    <h1 style="color:#ffffff; font-size:50px; font-family:fantasy;">KenzieGram</h1>
                </header>
                <h3>Photo Uploaded!</h3>
                <a href="/">Back</a>
                <div style="margin-top:40px">
                    <img src="uploads/${req.file.filename}">
                </div>
            </body>
            </html>`
        );
  })


app.listen(port);


const express = require('express');
const app = express();
const ip = require('ip');
const fs = require('fs');
const dotenv = require('dotenv');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const PORT = process.env.PORT || 8086;
const bucket = 'qrit';
const crypto = require('crypto');
const { get } = require('http');

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});

// html file containing upload form
var upload_html = fs.readFileSync("./public/index.html");

app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {

    res.send(upload_html);
});


app.get('/upload', function (req, res) {
    res.redirect('/');
});

try {
    app.post('/upload', function (req, res) {
        var form = new formidable.IncomingForm({
            uploadDir: __dirname + '/tmp',
            keepExtensions: true
        });
        form.maxFileSize = 1024 * 1024 * 300;
        form.parse(req, (err, field, files) => {
            var file = files.upload;
            var hash = crypto.createHash('sha256');
            var secret = Math.random()*10000;
            var ext = file.name.split('.');
            ext = ext[ext.length-1];
            hash.update(file.name+secret);
            var name = hash.digest('hex')+'.'+ext;
            var content = fs.readFileSync(file.path);
            var expiry = new Date();
            expiry.setHours(expiry.getHours()+5);
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: name, // File name you want to save as in S3
                Body: content,
                Expires:expiry
            };
            s3.upload(params, (err, data) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('Data uploaded on S3..');
                    var downloadPath = data.Location;
                    var constant = {
                        "name": file.name,
                        "link": downloadPath
                    };
                    fs.unlinkSync(file.path);
                    res.status(200).send({
                        success: true,
                        data: constant
                    });
                }
            });



        });

        //     form.on('file', function (name, file) {

        //         if (file.name === "") {
        //             res.sendStatus(404);
        //         }
        //         else {
        //             console.log(file);
        //             //the path of the file from where the file can be downloaded
        //             // console.log(file);
        //             // 
        //             // 
        //             // console.log(hash.digest('hex'));
        //             // console.log(file.path);
        //             // file.path = __dirname+'/'+file.name;

        //             // 
        //             // 

        //             // 

        //             // 


        //             // 
        //             // console.log(file.path);
        //             // //copying the file to the server
        //             // file.path = __dirname + '/public/uploads/' + file.name;
        //             // fs.
        //             //console.log(constant);
        //             // fs.copyFile(file.path,file.name,(err)=>{
        //             //     if(err){
        //             //         console.log(err);
        //             //     }
        //             //     else{
        //             //         console.log(file.name+' copied..');
        //             //     }
        //             // });


        //             
        //         }
        //     });
    });

}
catch (e) {
    console.log(e);
}
app.listen(PORT, function () {
    console.log("QRit: Running on", PORT);
});

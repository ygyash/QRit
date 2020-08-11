const express = require('express');
const app = express();
const fs = require('fs');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const PORT = process.env.PORT || 8086;
const { v4: uuidv4 } = require('uuid');
const url = require('url');

dotenv.config();

app.use(express.json());

AWS.config.update({
    accessKeyId: process.env.AWS_ID, // Generated on step 1
    secretAccessKey: process.env.AWS_SECRET, // Generated on step 1
    region: 'us-east-2', // Must be the same as your bucket
    signatureVersion: 'v4',
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

app.get('/getSignedUrlApi', async (req, res) => {
    try {
        var body = url.parse(req.url, true).query;
        if (body.size > 500000000) {
            res.sendStatus(400).send({
                error: "The file is too big."
            })
        }
        var s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET
        });

        var ext = body.name.split('.');
        ext = ext[ext.length - 1]

        var key = uuidv4() + '.' + ext;

        var uploadPreSignedUrl = s3.getSignedUrl('putObject', {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            ACL: 'authenticated-read',
            ContentType: body.type,
            Expires: 5 * 60 * 60
        });

        var downloadPreSignedUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            ResponseContentType: body.type
        });



        console.log(uploadPreSignedUrl);
        console.log(downloadPreSignedUrl);
        return res.status(200).send({
            uploadUrl: uploadPreSignedUrl,
            downloadUrl: downloadPreSignedUrl
        })
    }
    catch(e){
        console.log(e);
        res.sendStatus(500).send({
            error:e
        });
    }
});

app.listen(PORT, function () {
    console.log("QRit: Running on", PORT);
});

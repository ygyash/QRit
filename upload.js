var express = require('express');
var app = express();
var apiRouter = express.Router();
var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var QrCode = require('qrcode');
var bodyParser = require('body-parser');


 
// html file containing upload form
//var upload_html = fs.readFileSync("./index.html");
var upload_html = fs.readFileSync("./public/index.html");
var qrcode_html = fs.readFileSync('./public/qrcode.html');

app.use(express.static(__dirname + '/public'));

 
// replace this with the location to save uploaded files
var upload_path = "./build_stock";

app.get('/',function(req,res){
  
    res.send(upload_html);
});

app.post('/',function(req,res){
    res.end(upload_html);
});

app.post('/upload', function (req, res) {

     var form = new formidable.IncomingForm();
        form.parse(req);

    form.on('fileBegin', function (name, file){
        var updatedPath = "http://192.168.117.97:8000/build_stock/";
        var name = file.name
        for(i=0;i<file.name.length;i++)
        {  
            if(file.name[i]==" ")
            {   
                updatedPath+="%20";
                //console.log("Char encoded:"+updatedPath);
            }
            else if(file.name[i]=="-"){
                updatedPath += "%2D";
            }
            else if(file.name[i]=="_"){
                updatedPath += "%5F";
            }
            else if(file.name[i]=="~"){
                updatedPath+="%7E";
            }
            else
            {
                updatedPath+=file.name[i];
            }
        }
        console.log(updatedPath);
        var constant = {
            "file":
            {
                "name":name,
                "link":updatedPath
            }
        };
        fs.writeFile(__dirname + "/public"+"/data.json",JSON.stringify(constant,null,2),function(err){
            if(err) return console.log(err);
        });
        file.path = __dirname + '/build_stock/' + name;    

        /*QrCode.toDataURL(updatedPath,function(err,url){
               
                    var htmlImg = "<body><img src='"+url+"'/></body>";
                    res.write(htmlImg);
                    res.end();
                });*/
        //res.send(updatedPath);


    });
            res.end(qrcode_html);

    //res.sendFile(req.body.user.file);
});
/*app.get('/fileupload',function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
            
            var oldpath = files.filetoupload.path;
            var newpath = upload_path + files.filetoupload.name;

            
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;

                var updatedPath = "";
                for(i=13;i<newpath.length;i++)
                {  
                    if(newpath[i]==" ")
                    {   
                        updatedPath+="%20";
                        //console.log("Char encoded:"+updatedPath);
                    }
                    else if(newpath[i]=="-"){
                            updatedPath += "%2D";
                    }
                    else if(newpath[i]=="_"){
                        updatedPath += "%5F";
                    }
                    else if(newpath[i]=="~"){
                        updatedPath+="%7E";
                    }
                    else
                    {
                        updatedPath+=newpath[i];
                    }
                }

                console.log("updatedPath:"+updatedPath);
                 QrCode.toDataURL('http://192.168.117.97:8000/'+updatedPath,function(err,url){
                    var htmlImg = "<body><img src='"+url+"'/></body>";
                    res.send(htmlImg);
                });
            });
        });
    });

app.post('/fileupload',function(req,res){

});*/
 app.listen(8086);

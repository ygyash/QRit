var express = require('express');
var app = express();
var ip = require('ip');
var fs = require('fs');
var formidable = require('formidable');
const PORT = process.env.PORT||8086;


 
// html file containing upload form
var upload_html = fs.readFileSync("./public/index.html");

app.use(express.static(__dirname + '/public'));


app.get('/',function(req,res){
  
    res.send(upload_html);
});


app.get('/upload',function(req,res){
    res.redirect('/');
});
    
try{
    app.post('/upload', function (req, res) {
    //console.log("posted");
     var form = new formidable.IncomingForm();

        form.parse(req);
        form.maxFileSize = 1024*1024*1024;

    form.on('fileBegin', function (name, file,err){

        if(err){
            console.log(err);
            res.redirect('/');
        }
        if(file.name===""){
            res.sendStatus(404);
        }
        else{
            //the path of the file from where the file can be downloaded
            var downloadPath = "http://"+ip.address()+":"+PORT+"/build_stock/"+encodeURIComponent(file.name);
            var constant = {
                "name":file.name,
                "link":downloadPath
            };
            
            //copying the file to the server
            file.path = __dirname + '/public/build_stock/' + file.name;   
            //console.log(constant);
            res.status(200).json({
                success:true,
                data:constant
            });
        }
    });
});

}
catch(e){
	console.log(e);
}
 app.listen(PORT,function(){
 	console.log("QRit: Running on",PORT);
 });

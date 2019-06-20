var express = require('express');
var app = express();
var ip = require('ip');
var apiRouter = express.Router();
var fs = require('fs');
var formidable = require('formidable');



 
// html file containing upload form
var upload_html = fs.readFileSync("./public/index.html");
var qrcode_html = fs.readFileSync("./public/qrcode.html");

app.use(express.static(__dirname + '/public'));

 
// replace this with the location to save uploaded files
var upload_path = "./build_stock";

app.get('/',function(req,res){
  
    res.send(upload_html);
});

app.post('/',function(req,res){
  
    res.end(upload_html);
});



try{
	app.post('/upload', function (req, res) {

     var form = new formidable.IncomingForm();
        form.parse(req);
        form.maxFileSize = 1024*1024*1024;

    form.on('fileBegin', function (name, file){
    	//replace this with the ipv4 address of your computer in the network
    	//this is the link which will be downloaded
        var updatedPath = "http://"+ip.address()+":8000/build_stock/";
        var name = file.name;
        //updatedPath is changed to edit all the spaces and special characters present in the file name
         for(i=0;i<file.name.length;i++)
        {  
            if(file.name[i]==" ")
            {   
                updatedPath+="%20";
                
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
            //console.log("Char encoded:"+updatedPath);
        }
        console.log(updatedPath);
        var constant = {
            "file":
            {
                "name":name,
                "link":updatedPath
            }
        };
        /*writing the file name and the link of the file in a json file
            which can be accessed by the front end API for creating the QR code 
        */
        console.log(file.name);
       if(file.name!=undefined){
       	 fs.writeFile(__dirname + "/public"+"/data.json",JSON.stringify(constant,null,2),function(err){
            if(err) return console.log(err);
        });
        file.path = __dirname + '/build_stock/' + name;    
    }
    else{
    	res.sendStatusCode(404);
    }


    });
            res.end(qrcode_html);

    
});

}
catch(e){
	console.log(e);
}

 app.listen(8086,function(){
 	console.log("Sharing your file using QR Code: Running on 8086");
 });

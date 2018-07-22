	console.log("Hello");
      $(document).ready(function(){
          $.getJSON('/data.json',function(data){
            console.log(data);
            $.each(data.file,function(i,f){
              $("#file").html("Hello"); 
              console.log("IN the div");   
            });
          }); 
      });
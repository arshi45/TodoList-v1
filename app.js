const express= require("express");

const app = express();


app.get('/',function(req,res){
    res.send("hello my name is Arshdeep Singh");
})

app.listen(3000,function()
{
    console.log("Server Started on port 3000");
})
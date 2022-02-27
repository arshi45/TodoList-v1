const express= require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const _ = require("lodash");
const { redirect } = require("express/lib/response");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

mongoose.connect('mongodb+srv://admin-arsh:arsh123@cluster0.wkoqi.mongodb.net/todolist?retryWrites=true&w=majority')

const itemSchema = {
    name: String
}
const Item = mongoose.model("Item",itemSchema);

const listSchema = {
    name: String,
    tasks : [itemSchema]
}
const List = mongoose.model("List",listSchema);

app.get('/',function(req,res){

    Item.find({},function(err,result)
    {
        if( result.length === 0)
        {
            res.render("home",{listTitle:"Today",tasks:[{name:"Empty List"}]});
        }
        else{
            res.render("home",{listTitle:"Today",tasks:result});
        }
    });
});

app.post("/",function(req,res){
    const newTask = req.body.task;
    const list = req.body.list;

    const item = new Item({
        name : newTask
    });

    if(list === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:list},function(err,results)
        {
            if(results){
                results.tasks.push(item);
                results.save();
                res.redirect("/"+list);
            }
        });
    }
});

app.post("/delete",function(req,res){
    var itemID = req.body.checkbox;
    var listName = req.body.listName;

    if(listName === "Today")
    {
        Item.findByIdAndRemove(itemID,function(err)
        {
            if(!err)
            res.redirect("/");
        });
    }
    else
    {
        List.findOneAndUpdate(
            {name:listName},
            {$pull:{tasks:{_id:itemID}}},
            function(err)
            {
                if(!err)
                res.redirect("/"+listName);
            }
        );
    }
});

app.post("/list",function(req,res){
    const customList = req.body.newlist;
    console.log(customList);
    res.redirect("/"+customList);
});

app.get("/:customName",function(req,res){
    var customListName = _.capitalize(req.params.customName);

    List.findOne({name:customListName},
        function(err,result)
    {
        if(!result){
            const customName = new List({
                name: customListName,
            });
            customName.save();
            res.redirect("/"+customListName);
        }
        else{
            res.render("home",{listTitle:result.name,tasks:result.tasks})
        }
    });

});

app.listen(3000,function()
{
    console.log("Server Started on port 3000");
})
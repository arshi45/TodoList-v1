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
        
        List.find(function(err,result3){
            if(result3 === null)
            {
                const todayList = new List(
                    {
                    name:"Today"}
                    );
                    todayList.save();
                if( result.length === 0)
                {
                    res.render("home",{listTitle:"Today",tasks:[{name:"Empty List"}],lists:[{name:"Today"}]});
                }
                else
                {
                   res.render("home",{listTitle:"Today",tasks:result,lists:[{name:"Today"}]});
                }     
            }
            else
            {
                if( result.length === 0)
                {
                    res.render("home",{listTitle:"Today",tasks:[{name:"Empty List"}],lists:result3});
                }
                else{
                    res.render("home",{listTitle:"Today",tasks:result,lists:result3});
                }
            }
        });
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
            List.find(function(err,result2){
                res.render("home",{listTitle:result.name,tasks:result.tasks,lists:result2}) 
            });
        }
    });

});

app.post("/listDelete",function(req,res){
    const delList = req.body.delList;
    console.log(delList);
    List.findOneAndDelete({_id:delList},function(err)
    {
        if(!err){
            res.redirect("/");
        }
    });

})

app.listen(3000,function()
{
    console.log("Server Started on port 3000");
})
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const { type } = require("express/lib/response");
const app = express();
const _ = require('lodash');

const day = date.getDay();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://MihirHemnani:Hop27418@cluster0.owonk.mongodb.net/todolistDB");

const itemSchema = {
  name: {
    type: String,
    // required: [true, "Required"]
  }
};

//collection (modal)
const Item = mongoose.model("Item", itemSchema);


//modal is collection

const i1 = new Item({
  name: "Study"
});

const i2 = new Item({
  name: "Project"
});

const i3 = new Item({
  name: "Programming"
});

const defualts = [i1, i2, i3];

//list schema
const listSchema = {
  name: String,
  items: [itemSchema] 
}

//new collection -> List
const List = mongoose.model("List", listSchema);
// Item.deleteOne({_id: "622f3e2c01fd294d8e5fbeb2"}, function(err){
//   if(err)   console.log(err);
//   else console.log("Deleted");
// });

app.get("/", function(req, res) {

  
  Item.find(function(err, data){
    if(err) console.log(err);

    else {

      if(defualts.length === 0){
        
        Item.insertMany(defualts, function(err){
          if(err) console.log(err);
          else console.log("Inserted Defaults");
        });  
        res.redirect('/');
      }
      
      else{
        res.render("list", {listTitle:  day, newListItems: data});
      }

    }

  });

});


app.get('/:customsListName', function(req, res){
  const customListName = _.capitalize(req.params.customsListName); // enter List Name by user
  
  List.findOne({name: customListName}, function(err, foundList){
    if(err)   console.log(err);
    else {
      if(!foundList){
        //creating document for List collection
        // console.log("Don't Exist");
        // Create new List
        const list = new List({
          name: customListName,
          items: defualts
        });
        list.save();
        res.redirect('/' + list.name);
      }
      else{
        // console.log("Exist");
        res.render("list", {listTitle : foundList.name, newListItems : foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){

  const listName = req.body.list;
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  
  if(listName === day){
    item.save();
    res.redirect('/');
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
  
  // item.save();
  // res.redirect('/');
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});

app.post('/delete', function(req, res){
  // console.log(req.body.checkbox);
  const listName = req.body.listname;
  const checkedItem = req.body.checkbox;

  if(listName === day){
    Item.findByIdAndRemove({_id: checkedItem}, function(err){
      if(err) console.log(err);
      else {
        console.log("Deleted");
        res.redirect('/');
      }
    });
  }
  else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItem}}},
      function(err, foundList){
        if(!err){
        res.redirect('/' + listName);
      }
    });
  }

  /*
  Mongoose findOneAndUpdate()

  <ModalName>.findOneAndUpdate(
    {condtions},
    {updates},
    function(err, results){}
  );
  */
  //deleting form array that is inside a collection document
});


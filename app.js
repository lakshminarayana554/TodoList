//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// DB CONNECTION
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-LN:p8oFa36E3qIpHGJw@cluster0.w8vku2i.mongodb.net/todolistDB?retryWrites=true',{useNewUrlParser:true,
  useUnifiedTopology:true});
  
  mongoose.connection.on("error", err => {
  
    console.log("err", err)
  
  })
  mongoose.connection.on("connected", (err, res) => {
  
    console.log("Succesfully connected")
  
  })
};
  
const itemsSchema = ({
  name:String
});


const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"welcome to your todolist!"
});

const item2 = new Item({
  name:"Hot the + button to add a new item."
});

const item3 = new Item({
  name:"<-- hit this to delete an item."
});


const defaultItems = [item1,item2,item3];


const listSchema ={
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);




app.get("/", function(req, res) {

Item.find()
.then(function(foundItems){

  if(foundItems.length === 0){

    Item.insertMany(defaultItems)
    .then(function(result){
    console.log("successfully saved default items to DB")
    })
    .catch(function(err){
    console.log(err);
    });
    res.redirect("/");

  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
})
.catch(function(err){
  console.log(err);
})
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

   List.findOne({name:customListName})
  .then(function(foundList){
      if( foundList === null){
        
    const list = new List({
      name:customListName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+customListName)
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
      

  })
  .catch(function(err){
    console.log(err);
  })

});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
  res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }
});

app.post("/delete",function(req,res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove({_id:checkItemId})
  .then(function(){
   console.log("succesfully removed") 
   res.redirect("/")
  })

.catch(function(err){
  console.log(err)
})

  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}}).then(function(foundList){
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    })
  }

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

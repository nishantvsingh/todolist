
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose') //
const _=require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost/tdlDB') //

const itemsSchema = {
  name: String
}
const Item = mongoose.model("item", itemsSchema)

// const item1 = new Item({
//   name: "my first item"
// })
// const item2 = new Item({
//   name: "my secnod item"
// })
// const item3 = new Item({
//   name: "my third item"
// })

// const defaultitems = [item1, item2, item3]
const defaultitems=[]



//=================for custom list..using express routing=========
const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = new mongoose.model("List", listSchema)
//========================================================================

// Item.insertMany(defaultitems,function(err){
//   if(err) console.log(err) 
//   else console.log("SUCCESSFULLY saved default items to DB")
// })



const workItems = [];

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    //========= E I T H E R =====
    // if (foundItems.length === 0) {

    //   Item.insertMany(defaultitems, function (err) {
    //     if (err) console.log(err)
    //     else console.log("SUCCESSFULLY saved default items to DB")
    //     res.redirect("/")
    //   })
    // } else {
    //   res.render("list", { listTitle: "Today", newListItems: foundItems });
    // }
////========== O  R ====== 
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  })
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

if(itemName!=""){ //to prevent empty string from saving into todolist
   
  const newITM = new Item({
    name: itemName
  });
  //doing all this so that input data form non-home routes are not saved to home route collection
  //
  if (listName === "Today") {
    newITM.save();
    //console.log(defaultitems)
    res.redirect('/')
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newITM)  //new item is pushed to array of foundlist(foundlist is non home route)
      foundList.save()

      res.redirect('/' + listName)
    })
  }
}
else{// after preventing empty string
 if (listName === "Today") res.redirect('/')
 else res.redirect('/' + listName)
}

});

app.post('/delete', (req, res) => {
  //console.log(req.body.checkboxname)
  const checkedItemId = req.body.checkboxname;
  const listName = req.body.listName
   
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function (err, dltres) {
     // if (err) console.log(err)
     // else console.log("deleted succesfully ", dltres)
    })
    //without callback deleteOne or findByIdAndRemove won't work
    res.redirect('/')

  }
  else{
   List.findOneAndUpdate( {name: listName}, { $pull : { items: { _id:checkedItemId } } },
      function(err,foundlist)
      {
      if(!err) res.redirect("/" + listName)
      
  } 
) 
}})
    //$pull takes out element from array(items)


//===========================CUSTOM LISTs============================

app.get("/:customListname", (req, res) => {
  // console.log(req.params.customListname)
  const customListName = _.capitalize(req.params.customListname)

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {// console.log("does not exist")

        const list = new List({
          name: customListName,
          items: defaultitems
        })
        list.save();

        res.redirect('/' + customListName)


      } else {   //console.log("it exists")
        res.render('list', { listTitle: foundList.name, newListItems: foundList.items })


      }
    }

  })


})






app.listen(3000, function () {
  console.log("Server started on port 3000");
});
//imported modules
const mongoClient = require('mongodb').MongoClient;
const LinkedList = require('./public/LinkedList')
const AuctionUser = require('./public/AuctionUser')
const Bid = require('./public/Bid')
const fileUpload = require('express-fileupload')
var express = require("express")
var ejs = require("ejs")

//database connection
const uri = "mongodb+srv://sit725:sit725@sit725.gwuvj.mongodb.net/ebay?retryWrites=true&w=majority";
const client = new mongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var port = process.env.PORT || 3000;
app = express();
server = app.listen(port);

//use the public folder for static content
app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');
//use express boady parser to get view data
app.use(express.urlencoded({ extended: true }));
//use default file upload
app.use(fileUpload());

//db collections
var collectionUsers;
var collectionProducts;

//linked list objects to store user and bidding
var userList = new LinkedList();
var biddingList = new LinkedList();

//to track user 
var user = null;
var userName = null;

//db collections
client.connect(err => {
  collectionUsers = client.db("ebay").collection("user");
  collectionProducts = client.db("ebay").collection("product");
});

//image upload function
const uploadImage = (req) => {

  if (req.files || req.files!==null) {
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let imageFile = req.files.File;
    let fileName = imageFile.name

    // Use the mv() save the image file in the server products folder
    imageFile.mv(__dirname + '/public/assets/images/products/' + fileName, function (err) {
      if (err)
        return res.send(err);
    });
  }
}

//search user in the userList function
var searchUser = (auctionUser) => {
  let currentNode = userList.head
  if (currentNode === null)
    return false
  while (currentNode !== null) {
    if (currentNode.data.username === auctionUser.username)
      return true
    currentNode = currentNode.next
  }
  return false
}

//delete a particular user from the list
var deleteUser = (auctionUser) => {

  let currentNode = userList.head
  let previousNode = null

  if (currentNode === null)
    return false
  while (currentNode !== null) {
    if (currentNode.data.username === auctionUser.username) {
      if (previousNode === null) {
        userList.head = currentNode.next
      } else {
        previousNode.next = currentNode.next
      }
      userList.count--;
      return true
    } else {
       previousNode = currentNode
      currentNode = currentNode.next
    }
  }
  return false
}

//All routes start from here

//main index page 
app.get('/', function (req, res) {  

  res.render('index', { 
    title: "eBay - Auction Market",
    user : user,
    userName : userName
  });
})

//registration process
app.post('/Register', function (req, res) {

  let username = req.body.Username
  let name = req.body.Name
  let password = req.body.Password
  let confirmPassword = req.body.Confirm_password

  if (password === confirmPassword) {

    collectionUsers.findOne({ username: username }, function (err, result) {
      if (err) throw err;

      if (result === null) {
        collectionUsers.insertOne({ name: name, username: username, password: password });
        res.render('signin', { 
          title: "eBay - Sign In",
          username: null,
          password: null,
          message: ''
        });
      } else {
        res.render('registration', {
          title: "eBay - Registration",
          name: name,
          username: null,
          password: password,
          confirm_password: confirmPassword,
          message: 'Username is already exist. Please try again.'
        });
      }
    });

  } else {
    res.render('registration', {
      title: "eBay - Registration",
      name: name,
      username: username,
      password: null,
      confirm_password: null,
      message: 'Password mismatched. Please try again.'
    });
  }
})

//registration page
app.get('/Registration', function (req, res) {
  let message = "";
  res.render('registration', {
    title: "eBay - Registration",
    name: null,
    username: null,
    password: null,
    confirm_password: null,
    message: null
  });
})

//login process
app.post('/Login', function (req, res) {

  let username = req.body.Username
  let password = req.body.Password

  let auctionUser = new AuctionUser();
  auctionUser.username = username;

  if (searchUser(auctionUser)) {
    res.render('already_signedin', {
      title: "eBay - Already SignedIn"
    });

  } else {

    collectionUsers.findOne({ username: username, password: password }, function (err, result) {
      if (err) throw err;
      if (result === null) {
        res.render('signin', {
          title: "eBay - Sign In",
          username: null,
          password: null,
          message: 'Invalid credentials. Please try again.'
        });

      } else {
        user = result.name;
        userName = result.username;
        auctionUser.username = userName;
        if (searchUser(auctionUser)) {
          user = null
          userName = null
        } else {
          userList.addToList(auctionUser)
        }
        res.render('index', { 
          title: "eBay - Auction Market",
          user: user,
          userName: userName});
      }
    })
  }
})

//log off process
app.get('/Logoff', function (req, res) {

  let auctionUser = new AuctionUser();
  auctionUser.username = userName;

  if (deleteUser(auctionUser)) {
    user = null;
    userName = null;
  }
  res.render('index', { 
    title: "eBay - Auction Market",
    user: user,
    userName: userName });
})

//sign in page
app.get('/Signin', function (req, res) {
  res.render('signin', {
    title: "eBay - Sign In",
    username: null,
    password: null,
    message: null
  });
});

//product selling page
app.get('/Sell', function (req, res) {

  let auctionUser = new AuctionUser();
  auctionUser.username = userName

  if (!searchUser(auctionUser)) {
    message = 'Please sign in first to use the service'
    res.render('signin', {
      title: "eBay - Sign In",
      username: null,
      password: null,
      message: message
    });
  } else {
    res.render('list_item', {
      title: "eBay - List an Item",
      user: user,
      userName: userName,
      product_name: null,
      product_description: null,
      product_price: null,
      message: null
    });
  }
})

//product listing process
app.post('/ListItem', function (req, res) {
  let message = "";
  let productName = req.body.Product_name
  let productDescription = req.body.Product_description
  let productPrice = req.body.Product_price
  let productImage = 'default.jpg'
  let regex = /^(?!0,?\d)([0-9][0-9]{0,}(\.[0-9]{2}))$/

  if(req.files){
      productImage = req.files.File.name
  }

  if (regex.test(productPrice)) {
    uploadImage(req);
    collectionProducts.insertOne({
      name: productName,
      description: productDescription,
      price: productPrice,
      image: productImage,
      seller: userName
    });

    collectionProducts.find().toArray(function (err, result) {
      if (err) throw err;
      res.render('items_list', {
        title: "eBay - Items to Sell",
        user: user,
        userName: userName,
        results: result
      });
    });

  } else {
    res.render('list_item', {
      title: "eBay - list an Item",
      user: user,
      userName: userName,
      product_name: productName,
      product_description: productDescription,
      product_price: null,
      message: 'Invalid price format. (Valid formats: 0.00,00.00,000.00)'
    });
  }
   
})

//product listing page
app.get('/Buy', function (req, res) {

  collectionProducts.find().toArray(function (err, result) {
    if (err) throw err;
    res.render('items_list', {
      title: "eBay - Items to Sell",
      user: user,
      userName: userName,
      results: result
    });
  });

})

//individual product page (all biddings happenning here)
app.post('/Item', function (req, res) {

  let productId = req.body.Product_id

  let auctionUser = new AuctionUser();
  auctionUser.username = userName

  if (!searchUser(auctionUser)) {
    message = 'Please sign in first to use the service'
    res.render('signin', {
      title: "eBay - Sign In",
      username: null,
      password: null,
      message: message
    });
  } else {

    collectionProducts.find().toArray(function (err, results) {
      if (err) throw err;
      results.forEach(element => {
        if (element._id.toString() === productId) {
          res.render('individual_item', {
            title: "eBay - Item Info",
            user: user,
            userName: userName,
            result: element
          });
        }
      });
    });
  }
})

//confirmation of server started on particualr port
console.log("Listening on port ", port);

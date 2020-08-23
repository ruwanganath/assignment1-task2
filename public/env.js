//materialize components loading on page load
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  let options = null;
  var elemsSideNav = document.querySelectorAll('.sidenav');
  var elemsDropDown = document.querySelectorAll('.dropdown-trigger');
  var instances = M.Sidenav.init(elemsSideNav, options);
  var instances = M.Dropdown.init(elemsDropDown, options);
});

// class to define the AuctionUser on client side
class AuctionUser {
  constructor(username,bid) {
    this.username = username;
    this.bid = bid;
  }
}

// class to define the node on client side for the linked list
class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// class to define the linked list on client side
class LinkedList {
  constructor() {
    this.head = null;
    this.count = 0;
  }

 // adding to list funtion
  addToList(data) {

    let node = new ListNode(data);

    if (this.head === null) {
      this.head = node;
    } else {
      let currentNode = this.head;

      while (currentNode.next !== null) {
        currentNode = currentNode.next;
      }
      currentNode.next = node;
    }
    this.count++;
  }
}

//create the current auction user and bidding list on client side
var auctionUser = new AuctionUser();
var biddingList = new LinkedList();

//setting auction timer and num bidding for 0 at the start of the client page
var auctionTimer = 0;
var numBids = 0;

//set the auction user object username to current logged in user
function setCurrentUser(auctionUser) {
  auctionUser.username = document.getElementById("input-welcome-user").value;
}

//when bidding page loads and if the button is available all bidding functions start here
var biddingButton = document.getElementById("btn-bidding");
//setting the auction time to 2 mins
var auctionDuration = 120000; 

if (biddingButton) {
  biddingButton.addEventListener('click', function () {

    let regex = /^(?!0,?\d)([0-9][0-9]{0,}(\.[0-9]{2}))$/
    let bidingValue = document.getElementById("biding-price").value
    let productPrice = document.getElementById("product-price").innerText
    //stripping the leading $ mark from the price and converting to a number
    productPrice = Number(productPrice.replace(/[^0-9.-]+/g, ""));
    document.getElementById("error-bidding").innerHTML = '';

    //check for bidding price for valid currency format
    if (regex.test(bidingValue)) {
      //entered bidding price should always greater than the asking price
      if (bidingValue < productPrice) {
        document.getElementById("error-bidding").innerHTML = 'Bidding amount is less than the asking price.'

      } else {
        //at the first bidder clicking the bid button auction start here
        if ((auctionTimer === 0) && (numBids === 0)) {
          let auction =  setInterval(() => {            
            //add 1 sec to timer at every interval
            auctionTimer = auctionTimer + parseInt(1000)
            document.getElementById("time-left").innerHTML = 'Auction started - ' + milisecondsToMinsSecs(auctionTimer)
           //if time reaches, auction finishes and display the winner
            if (auctionTimer === auctionDuration) {
              clearInterval(auction)
              displayWinner(biddingList)              
            }
          }, 1000);
        }        
        numBids++;
        //set auctionUser bid
        auctionUser.bid = bidingValue
        //add bidding to the list
        addBidToList(auctionUser)
        document.getElementById("last-bidding").innerHTML = '<b>' + numBids + ' Bids - Last Bidding Price - ' + '<i>$ ' + auctionUser.bid + '</i></b>'
      }
    } else {
      document.getElementById("error-bidding").innerHTML = 'Invalid price format. (Valid formats: 0.00,00.00,000.00)'
    }
  });
  
}

// adding the current user as the bidder to the bidding list
function addBidToList(auctionUser) {
  biddingList.addToList(auctionUser)
}

//display the winner
function displayWinner(biddingList) {
  document.getElementById("frm-bid").style.visibility = "hidden"
  document.getElementById("biding-status").style.visibility = "visible"
  document.getElementById("total").style.visibility = "visible"  
  document.getElementById("biding-status").innerHTML = '<h5> YOU WON THE BIDDING</h5></br> Thank you for shopping.'
  document.getElementById("total").innerHTML = 'Total<b class="right">$ '+auctionUser.bid+ '</b>'
}

//update the image src url on user selected image
function changeImage(inputData) {
  document.getElementById("img-image-upload").src = window.URL.createObjectURL(inputData.files[0])
}

//converting mili sceonds to minutes and seconds
function milisecondsToMinsSecs(millisecs) {
  let seconds = Math.floor(millisecs / 1000);

  let mins = Math.floor(seconds / 60);
  seconds -= mins * 60;
  seconds = '' + seconds;
  seconds = ('00' + seconds).substring(seconds.length);
  return mins + ":" + seconds;
}
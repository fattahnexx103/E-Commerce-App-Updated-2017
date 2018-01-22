//in the cart model we will recycle the old cart for an item if it is added twice
module.exports = function Cart(oldCart){ //initially this takes the oldCart object
  this.items = oldCart.items || {}; //sets the items of the new cart to the old cart items
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0; //does the same till her so the new cart is cloned as the old cart

  this.add = function(item, id){ //the add function takes an item and an id of the item
    var storedItem = this.items[id];  //see if the id exists inside the oldCart items
    if(!storedItem){ //if not the item
      storedItem = this.items[id] = {item: item, qty: 0, price: 0}; //create a new item
    }
    storedItem.qty++; //increase qty by 1 since item is added
    storedItem.price = storedItem.item.price * storedItem.qty; //take the price of the item and multiply it by qty
    this.totalQty++; //increase total qty by 1 as well
    this.totalPrice += storedItem.item.price; //and total price would be existing total price + new price of the item
  };

  this.generateArray = function(){
    var arr =[];
    for(var id in this.items){  //loop through the item object for the keys
      arr.push(this.items[id]); //push the individual items into array
    }
    return arr;
  };
};

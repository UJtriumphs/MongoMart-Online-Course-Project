var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function CartDAO(database) {
    "use strict";

    this.db = database;
    this.cartCollection = this.db.collection('cart');

    
    this.getCart = function(userId, callback) {
        "use strict";
        let queryDoc = { "userId": userId };
        this.cartCollection.findOne(queryDoc, function(err, userCart) {
            assert.equal(err, null);
            callback(userCart);
        });
    }


    this.itemInCart = function(userId, itemId, callback) {
        "use strict";
        let queryDoc = { 
            "userId": userId,
            "items._id": itemId
        };
        this.cartCollection.findOne(queryDoc, { "items.$": 1 }, function(err, result) {
            assert.equal(err, null);
            if (result !== null) {
                result = result.items[0];
            }
            console.log(result);
            callback(result);
        });
    }

    this.addItem = function(userId, item, callback) {
        "use strict";
        this.db.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            });
        
    };


    this.updateQuantity = function(userId, itemId, quantity, callback) {
        "use strict";

        let queryDoc = {
            userId: userId,
            "items._id": itemId 
        };
        let optionsDoc = {
            upsert: false, 
            returnOriginal: false 
        };
       
        let updateIncreaseQuantityDoc = {               
                $set: { "items.$.quantity": quantity }
        };
        let updateRemoveItemDoc = { $pull: { "items": { _id: itemId } } }; 
        let updateDoc = {};

        if (quantity === 0) {
            updateDoc = updateRemoveItemDoc;
        } else {
            updateDoc = updateIncreaseQuantityDoc;
        }

        this.db.collection('cart').findOneAndUpdate(queryDoc, updateDoc, optionsDoc, function(err, result) {
            assert.equal(err, null);
            console.log(result);
            callback(result.value);
        });
    }

    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            quantity: 1,
            reviews: []
        };

        return item;
    }

}


module.exports.CartDAO = CartDAO;

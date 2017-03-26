

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";
        let allCategoriesObject = { _id: "All", num: 0 };
        this.db.collection('item').aggregate([
            { $match: { category: { $ne: null } } },
            { $group: {
                _id: "$category",
                num: { $sum: 1 }
            } },
            { $sort: { _id: 1 } }
        ]).toArray(function(err, docs) {
            assert.equal(err, null);
            let allCategoriesCount = 0;
            for (let i = 0; i < docs.length; i++) {
                allCategoriesCount = allCategoriesCount + docs[i].num;
            }
            allCategoriesObject.num = allCategoriesCount;
            docs.unshift(allCategoriesObject);
            callback(docs);
        });
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";
        let queryDoc = { "category": category }
        if (category == "All") {
            queryDoc = {};
        }
        this.db.collection('item').find(queryDoc)
                                    .limit(itemsPerPage)
                                    .skip(page * itemsPerPage)
                                    .toArray(function(err, items) {
            assert.equal(err, null);
            callback(items);
        });

    }


    this.getNumItems = function(category, callback) {
        "use strict";
        let queryDoc = { category: category };
        if (category === "All") {
            queryDoc = {};          // Don't filter on "All"
        }
        this.db.collection('item').find(queryDoc).count(function(err, count) {
            if (err) throw err;
            callback(count);
        });
    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";
        let queryDoc = { $text: { $search: query } };
        this.db.collection('item').find(queryDoc)
                                    .limit(itemsPerPage)
                                    .skip(page * itemsPerPage)
                                    .toArray(function(err, items) {
                                        assert.equal(err, null);
                                        callback(items);
                                    }
        );
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";
        let queryDoc = { $text: { $search: query } };
        this.db.collection('item').find(queryDoc).count(function(err, count) {
            assert.equal(err, null);
            callback(count);
        });
    }


    this.getItem = function(itemId, callback) {
        "use strict";
        let queryDoc = { _id: itemId };
        this.db.collection('item').find(queryDoc).limit(1).next(function(err, item) {
            assert.equal(err, null);
            callback(item);
        });
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";


        let reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };
        let filterDoc = { "_id": itemId };
        let updateDoc = { $push: { "reviews": reviewDoc } };
        
        this.db.collection('item').updateOne(filterDoc, updateDoc, function(err, item) {
            assert.equal(err, null);
            callback(item);
        })
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
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;

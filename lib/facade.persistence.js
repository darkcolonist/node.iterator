var nedb = require('nedb'),
    nedbAsync = require('nedb-promise'),
    log = require('./helper.log');
var dbIteratorsNonAsync = new nedb({ filename: "data/iterators.db", autoload: true });

dbIterators = nedbAsync.fromInstance(dbIteratorsNonAsync);

var facade = {
  init: function(){
    log.log("facade.persistence initiatied...");
  },

  addIterator: async function(iterator){
    return await dbIterators.insert(iterator, function(err, doc){ /** inserted */ });
  },

  updateIterator: function(iterator){
    // console.log("updating", iterator._id);

    return dbIteratorsNonAsync.update({
      "_id":iterator._id},
      {$set:{runs: iterator.runs}}, {}, function(err, numReplaced){
        // console.log("updated", iterator._id);
        return numReplaced;
      });
  },

  fetchIterators: async function(){
    var results = await dbIterators.find({}, function(err, docs){});

    return results;
  }
};

module.exports = facade;
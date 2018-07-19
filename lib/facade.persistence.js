var nedb = require('nedb'),
    log = require('./helper.log');
var dbIterators = new nedb({ filename: "data/iterators.db", autoload: true });

var facade = {
  init: function(){
    log.log("facade.persistence initiatied...");
  },

  addIterator: function(iterator, callback){
    return dbIterators.insert(iterator, callback);
  },

  deleteIterator: function(iterator){
    return dbIterators.remove({_id: iterator._id}, {}, function(err, numRemoved){ /** deleted */ });
  },

  updateIterator: function(iterator){
    // console.log("updating", iterator._id);

    return dbIterators.update({
      "_id":iterator._id},
      {$set:{runs: iterator.runs}}, {}, function(err, numReplaced){
        // console.log("updated", iterator._id);
        return numReplaced;
      });
  },

  fetchIterators: function(callback){
    var results = dbIterators.find({}, callback);
  }
};

module.exports = facade;
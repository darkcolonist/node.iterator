var settings = {
  /**
   * the port in which this application will run
   * @type {Number}
   */
  port : 50000,
}

var express    = require('express'),
    async      = require('async'),
    uniqid     = require('uniqid'),
    bodyParser = require('body-parser'),
    http       = require('http'),
    request    = require('request'),
    moment     = require('moment'),

    app        = express(),
    server     = http.createServer(app),
    io         = require('socket.io').listen(server),

    log = require('./lib/helper.log'),
    persistenceFacade = require('./lib/facade.persistence');



app.use(express.static(__dirname + "/public"))
app.use(bodyParser.json())

app.get('/delete_iterator/:iterator_id', function(req, res){

  app_iterator.delete_iterator(req.params.iterator_id);

  res.json({
    code: 0,
    message: "SUCCESS: deleting iterator " + req.params.iterator_id
  });
});

app.post('/add_iterator', function(req, res){
  if(typeof req.body.url === 'undefined'){
    res.json(
      { 
        code : 1,
        message : "ERROR: url parameter is not a valid url"
      }
    )
    return
  }

  if(Number(parseFloat(req.body.cooldown)) != req.body.cooldown || req.body.cooldown < 1){
    res.json(
      { 
        code : 1,
        message : "ERROR: cooldown is invalid"
      }
    )
    return 
  }
  
  app_iterator.add_iterator(req.body.url, req.body.cooldown);

  res.json(
    { 
      code : 0,
      message : "SUCCESS: iterator added"
    }
  )
})

var app_iterator = {
  status: {
    iterators : []
  },
  broadcast_lastest_status: function(){
    io.emit('status', this.status)
  },

  broadcast_lastest_status_worker: function(){
    app_iterator.broadcast_lastest_status()

    setTimeout(app_iterator.broadcast_lastest_status_worker, 1000)
  },

  curl: function(an_iterator, url, callback){
    var date_started = moment().format("YYYY-MM-DD HH:mm:ss");

    request.get(url)
      .on("response", function(){
        var date_ended = moment().format("YYYY-MM-DD HH:mm:ss");
        callback(an_iterator, {
          status: "success",
          date_started: date_started,
          date_ended: date_ended
        })
      })
      .on("error", function(err){
        var date_ended = moment().format("YYYY-MM-DD HH:mm:ss");
        log.log("there was a problem calling "+url+". details: "+err,"error");
        callback(an_iterator, {
          status: "error",
          error: err,
          date_started: date_started,
          date_ended: date_ended
        })
      })
  },

  worker: function(){
    for (var i = 0; i < this.status.iterators.length; i++) {
      var current_iterator = this.status.iterators[i]

      if(current_iterator.waiting == 0){
        current_iterator.waiting = current_iterator.cooldown
        current_iterator.status = "running"
        
        app_iterator.curl(current_iterator, current_iterator.url, function(an_iterator, options){
          an_iterator.status = "waiting"
          an_iterator.runs++
          an_iterator.elapsed = 0

          persistenceFacade.updateIterator(an_iterator);
        })
      }

      if(current_iterator.status == 'waiting')
        current_iterator.waiting--
      else if(current_iterator.status == 'running')
        current_iterator.elapsed++
      else
        current_iterator.waiting = current_iterator.cooldown
    }

    setTimeout(function(){
      app_iterator.worker()
    }, 1000)
  },

  delete_iterator: function(iterator_id){
    var iterator_index = app_iterator.status.iterators.findIndex(function(e){
      return e._id == iterator_id;
    });

    var iterator = this.status.iterators[iterator_index];

    this.status.iterators.splice(iterator_index, 1);
    persistenceFacade.deleteIterator(iterator);

    log.log(["deleted iterator",iterator]);
  },

  add_iterator: function(url, cooldown){
    var new_iterator = {
      url: url,
      cooldown: cooldown,
      name: app_util.truncate_middle(url, 40, " ... "),
      enabled: true,
      status: "waiting",
      elapsed: 0,
      waiting: cooldown,
      runs: 0,
      added: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    persistenceFacade.addIterator(new_iterator, inserted_iterator);

    function inserted_iterator(err, new_iterator){
      app_iterator.status.iterators.push(new_iterator);

      app_iterator.sort_iterators();

      log.log(["new iterator",new_iterator]);
    }
  },

  sort_iterators: function(){
    app_iterator.status.iterators.sort(mySorter);

    function mySorter(a,b){
      if (a.url < b.url)
        return -1;
      if (a.url > b.url)
        return 1;
      return 0;
    }
  },

  init: function(){
    persistenceFacade.init();

    // load iterators from database
    persistenceFacade.fetchIterators(fetchedIterators);

    function fetchedIterators(err, iterators){
      app_iterator.status.iterators = iterators;

      server.listen(settings.port)
      log.log("Server is listening to port "+settings.port)

      // start the iterator worker
      app_iterator.worker()

      // start the broadcast worker
      app_iterator.broadcast_lastest_status_worker()
    }
  },

  test_init: function(){
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=nechrons", 1)
    this.add_iterator("http://dev.test/curlable.php?client=jupiter", 4)
    this.add_iterator("http://dev.test/curlable.php?client=chronus", 7)
    this.add_iterator("http://dev.test/curlable.php?client=thanatos", 10)

    /**
     * available test-cases for curlable:
     *   http://dev.test/curlable.php?client=nechrons
     *   http://dev.test/curlable.php?client=space
     *   http://dev.test/curlable.php?client=olympus
     *   http://dev.test/curlable.php?client=thanus
     *   http://dev.test/curlable.php?client=jupiter
     *   http://dev.test/curlable.php?client=chronus
     *   http://dev.test/curlable.php?client=thanatos
     *   http://dev.test/curlable.php?client=blackhole
     */
  }
}

var app_util = {
  truncate_middle : function (fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr
    
    separator = separator || '...'
    
    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2)
    
    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars)
   }
}


io.on('connection', function(socket){
  // do something on client connection
})

// init the app (load from database)
// app_iterator.test_init()
app_iterator.init()
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
    nedb       = require('nedb'),
    moment     = require('moment'),

    app        = express(),
    server     = http.createServer(app),
    io         = require('socket.io').listen(server)

app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({
  extended: true
}))

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

  worker: function(){
    for (var i = 0; i < this.status.iterators.length; i++) {
      var current_iterator = this.status.iterators[i]

      if(current_iterator.waiting == 0){
        current_iterator.waiting = current_iterator.cooldown
        current_iterator.runs++
      }

      if(current_iterator.status == 'waiting')
        current_iterator.waiting--
      else
        current_iterator.waiting = current_iterator.cooldown
    }

    setTimeout(function(){
      app_iterator.worker()
    }, 1000)
  },

  test_init: function(){
    var sample_iterators = [
      {
        url: "http://dev.test/curlable.php?client=nechrons",
        cooldown: 1,
        enabled: true,
        status: "waiting",
        elapsed: 0,
        waiting: 1,
        runs: 0,
        added: "2016-02-23 00:00:00"
      },
      {
        url: "http://dev.test/curlable.php?client=jupiter",
        cooldown: 4,
        enabled: true,
        status: "waiting",
        elapsed: 0,
        waiting: 4,
        runs: 0,
        added: "2016-02-23 00:00:00"
      },
      {
        url: "http://dev.test/curlable.php?client=chronus",
        cooldown: 7,
        enabled: true,
        status: "waiting",
        elapsed: 0,
        waiting: 7,
        runs: 0,
        added: "2016-02-23 00:00:00"
      },
      {
        url: "http://dev.test/curlable.php?client=thanatos",
        cooldown: 10,
        enabled: true,
        status: "waiting",
        elapsed: 0,
        waiting: 10,
        runs: 0,
        added: "2016-02-23 00:00:00"
      }
    ]

    for (var i_index = 0; i_index < sample_iterators.length; i_index++) {
      sample_iterators[i_index].name = app_util.truncate_middle(
        sample_iterators[i_index].url, 40, " ... ")
    }

    this.status.iterators = sample_iterators
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


server.listen(settings.port)
console.log("Server is listening to port "+settings.port)

// init the app (load from database)
app_iterator.test_init()

// start the iterator worker
app_iterator.worker()

// start the broadcast worker
app_iterator.broadcast_lastest_status_worker()
var myApp = angular.module('myApp', []);

myApp
  .factory('socket', function(){
    return io.connect()
  })
  .controller('AppCtrl', ['$scope', '$http', 'socket', function($scope, $http, socket){
    $scope.queues = []

    socket.on('status', function(data){
      $scope.iterators = data.iterators
      // $scope.tasks = data.tasks
      try_digest();
    })

    socket.on('iterator:fetch_errors', function(data){
      $scope.error = data
      try_digest();
    })

    $scope.add_iterator = function(){
      console.log($scope.iterator);
      $http.post('/add_iterator', $scope.iterator).success(function(response){
        if(response.code == 0){
          $scope.iterator.save_success = true
        }else{
          $scope.iterator.save_error = true
          $scope.iterator.save_error_message = response.message
        }

        setTimeout(function(){
          $scope.iterator.save_success = false
          $scope.iterator.save_error = false
        }, 5000)
      })
    }

    $scope.resume_iterator = function(name){
      socket.emit('iterator:resume', name)
    }

    $scope.pause_iterator = function(name){
      socket.emit('iterator:pause', name)
    }

    $scope.fetch_errors = function(name){
      socket.emit('iterator:fetch_errors', name)
    }

    $scope.re_queue_failed = function(failed_id){
      socket.emit('iterator:re_queue_failed', failed_id) 
    }

    var try_digest = function(){
      if(!$scope.$$phase){
        $scope.$digest()
        // console.log("digest success");
      }else{
        // console.log("digest running, will try in half a second..");
        setTimeout(try_digest, 500);
      }
    }

}])
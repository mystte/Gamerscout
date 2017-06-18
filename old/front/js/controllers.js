'use strict';
/* Controllers */

var findIdInArray = function(arr, search) {
  var res = -1;
    var len = arr.length;
    while( len-- ) {
        if(arr[len]._id.toString() === search.toString()) {
          res = len;
          return len;         
        }
    }
    return -1;
}

var repflameControllers = angular.module('repflameControllers', []);


// route /home
repflameControllers.controller('HomeCtrl', ['$scope', '$http', '$location', '$window',
  function($scope, $http, $location, $window) {
    $scope.isFormValid= function(){
      if ($scope.search != null){
        return true;
      }
    };

    $scope.redirectToSearch = function() {
      if($scope.search == null || $scope.search == ''){
        return;
      }
      else if ($scope.search) {
        $window.location.href = '/#/gamers?name=' + $scope.search;
      } else {
        $window.location.href = '/#/gamers';
      } 
    };

  }]).directive('myEnter', function () {
    return function (scope, element, attrs, window) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) { // ENTER PRESSED
              scope.redirectToSearch();
              event.preventDefault();
            }
        });
    };
});

// route /gamers
repflameControllers.controller('PlayersListCtrl', ['$scope', 'Gamer', '$http', '$location', '$window', '$timeout', 'ConfigService',
  function($scope, Gamer, $http, $location, $window, $timeout, ConfigService) {
    $scope.search = {};
    console.log($location.search().name);
    // Check if there is a search query param
    if (typeof $location.search().name != "undefined") {
      $scope.search.text = $location.search().name;
      $http.get(ConfigService.api_base_url_prod + ":" + ConfigService.api_base_port + '/api/1/search/all/' + $scope.search.text).then(function(response){
        $scope.loading = "ng-hide";
        $scope.players = response.data;
      });
    }
    // Do search when clicking search button
    $scope.doSearch = function() {
      $timeout(function() {
        if ($scope.search.text) {
          $window.location.href = '/#/gamers?name=' + $scope.search.text;
        }
      }, 900);
    };

    $scope.$watch('search.text', function(value) {
      console.log("value = ", value);
    });

    $scope.$on('$viewContentLoaded', function(){
      //Here your view content is fully loaded !!
    });
  }]).directive('enterSearch', function () {
    return function (scope, element, attrs, window) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) { // ENTER PRESSED
              scope.doSearch();
              event.preventDefault();
            }
        });
    };
  });

// route /gamers/:gamerId
repflameControllers.controller('PlayerDetailsCtrl', ['$scope', '$routeParams', '$http', '$window', '$route', 'ConfigService',
  function($scope, $routeParams, $http, $window, $route, ConfigService) {
    $scope.gamerId = $routeParams.gamerId;
    $scope.chosenTagList = [],
    $scope.postTwice = "ng-hide";
    $scope.postSuccess = "ng-hide";


    $http.get(ConfigService.api_base_url_prod + ":" + ConfigService.api_base_port + '/api/1/gamer/' + $scope.gamerId).then(function(response){
      $scope.profile = response.data;
    });
    $http.get(ConfigService.api_base_url_prod + ":" + ConfigService.api_base_port + '/api/1/tags').then(function(response){
      $scope.tags = response.data.tags;
    });
    // Post a review
    $scope.update = function(review, review_type) {
      if (review_type != "REP" && review_type != "FLAME") {
        review_type = null;
      }
      if(comment == "" || comment == null){
        review_type = null;
      }
  		var data = {
  			"id" : $scope.gamerId,
  			"comment" : review,
        "review_type" : review_type,
  			"tags" : $scope.chosenTagList
  		};
      $http({
        method: 'POST',
      	url: 'http://ec2-52-26-156-116.us-west-2.compute.amazonaws.com:8001/api/1/gamer/review',
      	data: data,
      	headers: {'Content-Type': 'application/json'}
      }).then(function(response) {
        // Review successfully posted
        
        if (response.status == 201) {
          $scope.postSuccess = "true";
          $scope.postTwice = "ng-hide";
          $http.get('http://ec2-52-26-156-116.us-west-2.compute.amazonaws.com:8001/api/1/gamer/' + $scope.gamerId).then(function(response) {
            $scope.profile = response.data;
          }).catch(function(reason) {
            console.log("Error when getting the new profile");
          });
        }
        // Error when posting review
      }).catch(function(reason) {
        // Show error message
        $scope.postTwice = "true";
        $scope.postSuccess = "ng-hide";
      });
    };
      
    // Set the tag to the chosenTagList when clicking a tag button
    $scope.setTag = function(tag) {
      // Check that there is no more than 3 selected tags
      if ($scope.chosenTagList.length < 3) {
        $scope.count+= 1;
        console.log($scope.count);
        // Check if the tag already exists
        var idx = findIdInArray($scope.chosenTagList, tag._id);
        if (idx == -1) {
          var chosenTag = {}
          chosenTag._id = tag._id;
          chosenTag.name = tag.name;
          chosenTag.type = tag.type;
          $scope.chosenTagList.push(chosenTag);
        } else {
          $scope.chosenTagList.splice(idx, 1);
        }
        console.log($scope.chosenTagList);
      }
      else{
          $scope.count+=1;
          console.log("Bang");
          if ($scope.count >= 3){
            countBool == true;
            console.log("bool");
          }  
      }
    }
  }]);

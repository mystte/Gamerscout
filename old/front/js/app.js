'use strict';

/* App Module */

var repflameApp = angular.module('repflameApp', [
  'ngRoute',
  'repflameControllers',
  'repflameServices'
]);

repflameApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when ('/home', {
        templateUrl:'partials/home.html',
        controller: 'HomeCtrl'
      }).
      when('/gamers', {
        templateUrl: 'partials/gamerList.html',
        controller: 'PlayersListCtrl'
      }).
      when('/gamers/:gamerId', {
        templateUrl: 'partials/gamerProfile.html',
        controller: 'PlayerDetailsCtrl'
      }).
      when('/gamers/:gamerId/review', {
        templateUrl: 'partials/gamerReview.html',
        controller: 'PlayerReviewCtrl'
      }).
      otherwise({
        redirectTo:'/home'
      });
      //*/
  }]);


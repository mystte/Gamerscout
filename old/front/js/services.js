'use strict';

/* Services */
var repflameServices = angular.module('repflameServices', ['ngResource']);

repflameServices.factory('Gamer', ['$resource',
  function($resource){
    return $resource('http://52.26.156.116:8000/api/1/search/all/:gamertag', {}, {
      query: {method:'GET', params:{gamertag:'Mystte'}, isArray:true}
    });
}]);

repflameServices.factory('ConfigService', function() {
  return {
      api_base_url_local : 'http://localhost',
      api_base_url_prod : 'http://192.99.3.158',
      api_base_port : 8001,
      mongodb : 'mongodb://localhost:',
      project_name : 'repflame-api'
  };
});
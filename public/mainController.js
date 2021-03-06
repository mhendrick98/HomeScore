angular.module('myApp',[]).controller('main',['$scope','$http', function($scope, $http){
  console.log("The controller is working !");
  var report = [];
  $scope.submit = function(){
    var addressInfo = {
      rawAddressString: $scope.address
    };
    $scope.addressQuery = addressInfo.rawAddressString;
    $scope.address = ""; //reset input field
    $http.post("post/sendAddressInfo",addressInfo).then(function(response){
      $scope.showReport = true;
      var result = response.data;
      console.log("raw output is " + typeof(result));
      $scope.quietValue = result.quietValue;
      $scope.safetyValue = result.safetyValue;
      $scope.noiseReport = result.noiseReport;
      $scope.safetyReport = result.safetyReport;
      $scope.hubwayStations = result.hubwayStations;
      $scope.transitStations = result.transitStations;
      $scope.hospitals = result.hospitals;
      $scope.schools = result.schools;
      $scope.superScore = result.superScore;
      $scope.rating = result.rating;
      document.getElementById('superScore').scrollIntoView();
    })
  };
}])

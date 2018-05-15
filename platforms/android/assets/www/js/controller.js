angular.module('lectorQR.controller', ['ionic','ngCordova','ngStorage'])

.controller('lectorController',function($scope,$localStorage,$ionicPopup,$cordovaBarcodeScanner, $http){
	
	if($localStorage.user==undefined && $localStorage.password==undefined) {
		$scope.logged=false;
	}else{
		$scope.logged=true;
		$scope.username=$localStorage.user;
		$scope.url=$localStorage.url;
		$scope.password=$localStorage.password;
	}
	$scope.showAlert = function(tittle,message) {
	   var alertPopup = $ionicPopup.alert({
	     title: tittle,
	     template: message
	   });
	 };
	$scope.logout=function(){
		$scope.logged=false;
		$localStorage.password=undefined;
		$scope.password=undefined;
		

	}
	$scope.login=function(){
	if($scope.url!= undefined && $scope.username!=undefined && $scope.password !=undefined) {
    	$http.get('http://'+$scope.url+'/api/login_qrapp/?username='+$scope.username+'&password='+$scope.password)
	    .success(function(data, status, headers,config){
	    	if(data.status=='succes'){
	    		$scope.logged=true;
	    		$localStorage.user=$scope.username;
				$localStorage.password=$scope.password;
				$localStorage.url=$scope.url;
				
	    	}else{
	    		$scope.showAlert(data.status,data.message);
	    	}
	      
	    })
	    .error(function(data, status, headers,config){
	      console.log(status);
	      if (status==-1){
	      	$scope.showAlert("error","no se pudo establecer conexión a la url ingresada");	
	      }else{
	      $scope.showAlert(data.status,data.message);
}
	    })
	    .then(function(result){
	    	
	     
	    });
	}
	else {
		$scope.showAlert("oops!","parece que no se ingresarón los datos correctamente");
	}	
	
	}

	
	$scope.leercodigo=function () {
		$cordovaBarcodeScanner.scan().then(function(imagenEscaneada){
			if (imagenEscaneada.text!=undefined){
			$http.get(imagenEscaneada.text+'/?username='+$scope.username+'&password='+$scope.password)
			    .success(function(data, status, headers,config){
			      if(!data.message){
			      	$scope.showAlert("Ha ocurrido un error al escanear el código QR, asegurate que es el código correcto");
			      }else{
			      	$scope.showAlert(data.status,data.message);
			      }
			      
			    })
			    .error(function(data, status, headers,config){
			      
			      if(!imagenEscaneada.cancelled){
			      	$scope.showAlert("Ha ocurrido un error al escanear el código QR, asegurate que es el código correcto");
			      }

			    })
			    .then(function(result){
			     
			});
			    }
		},function(error){
					    
 		$scope.showAlert("Ha ocurrido un error al escanear el código QR, asegurate que es el código correcto");	
  		})
	}
	
});
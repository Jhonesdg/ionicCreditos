angular.module('Creditos', ['ngResource','ngStorage'])
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
}])

.controller('AppController', ['$scope',"$localStorage", function($scope,$localStorage) {
    $scope.login=false;
    $scope.logged=function () {
        if($localStorage.user==undefined){
            $scope.login=false;
        }else{
            $scope.login=true;
        }
    }
    $scope.logged();

}])


.factory('Solicitud', function($resource) {
  return $resource('/solicitudes/:id', { id: '@_id' }, {
    update: {
      method: 'PUT' // this method issues a PUT request
    }
  }, {
    stripTrailingSlashes: false
  });
})



.factory('RegisterClient',function ($resource) {
    return $resource('/usuarios/register')

})
.factory('CreateConsultant',function ($resource) {
    return $resource('/usuarios/create')

})
.factory('UserRequests', function($resource) {
    return $resource('/solicitudes/:userid/solicitudes');
})
.factory('UserCredits', function($resource) {
    return $resource('/credits/:userid/credits');
})

.factory('ManageRequests', function($resource) {
    return $resource('/solicitudes/manage');
})


.directive("login", ["$http","$localStorage","RegisterClient", function ($http,$localStorage,RegisterClient){
    var controller = ["$scope", function($scope){
        $scope.regisrterclient = new RegisterClient();
        $scope.isregister=false;

        $scope.seeRegister=function(){
            $scope.isregister=!$scope.isregister;
        }
        $scope.registeruser=function() {

            $scope.regisrterclient.username = $scope.regisrterclient.email;
            RegisterClient.save($scope.regisrterclient, function() {
             swal("Registro Extitoso, por favor inicie sesión");
             $scope.$parent.logged();
             $scope.seeRegister();
            });
        }
        $scope.login=function(){
        if($scope.username!=undefined && $scope.password !=undefined) {
            var data = new FormData();
            data.append("username", $scope.username);
            data.append("password", $scope.password);
            data.append("device_token", "1");

            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener("readystatechange", function () {

                if(this.status == 200 && this.readyState == 4){
                    var response=JSON.parse(this.response);
                    $localStorage.user=response.user.username;
                    $localStorage.role=response.user.role;
                    $localStorage.id=response.user.id;
                    $scope.$parent.logged();
                    $scope.$apply();

                }else if (this.status==400){
                    swal("Ocurrio un error, verifique que los datos son correctos");
                }
            });

            xhr.open("POST", "/api_login/");

            xhr.send(data);

        }
        else {
            swal("oops!","parece que no se ingresarón los datos correctamente");
        }

        }
    }]
    return {
        restrict : "EA",
        controller : controller,
        transclude : true,
        templateUrl : ("/static/templates/login.html"),
        scope : {
            CONTENT : "=content",

        }
    }
}])

.directive("dashboard", ["$http","Solicitud","UserRequests","UserCredits","ManageRequests","$localStorage","CreateConsultant", function ($http,Solicitud,UserRequests,UserCredits,ManageRequests,$localStorage,CreateConsultant){
    var controller = ["$scope", function($scope){
        $scope.newsolicitud = new Solicitud();
        $scope.singlerequest=false;
        $scope.dashboard=true;
        $scope.consultant= new CreateConsultant();
        $scope.role=$localStorage.role;
        $scope.newform=false;
        $scope.list=function(){
            if($scope.role==1){
                    $scope.solicitudes = UserRequests.query({ userid: $localStorage.id });
                    $scope.creditos = UserCredits.query({ userid: $localStorage.id });
                }else if($scope.role==2){
                $scope.solicitudes = Solicitud.query();
            }else if($scope.role==3){
                $scope.solicitudes=ManageRequests.query();
            }

        }
        $scope.list();
        $scope.detail=function(id){
            $scope.solicitud = Solicitud.get({ id: id }, function() {
             console.log($scope.solicitud);
             $scope.singlerequest=true;
             }); // get() returns a single entry

        }
        $scope.logout=function(){
		$localStorage.user=undefined;
		$localStorage.role=undefined;
        $scope.$parent.logged();
		}
		$scope.hidedashboard=function(){
            $scope.dashboard=false;
        }
        $scope.seedashboard=function(){
            $scope.dashboard=true;
        }

        $scope.backlist=function(){
            $scope.singlerequest=false;
        }
        $scope.newrequest=function(){
            $scope.newform=!$scope.newform;
        }
        $scope.save=function () {
            $scope.newsolicitud.status = 0;
            $scope.newsolicitud.client = $localStorage.id;
            Solicitud.save($scope.newsolicitud, function() {
            swal("Solicitud guardada con éxito");
             $scope.list();
             $scope.newrequest();
            });

        }
        $scope.createconsultant=function() {
            $scope.consultant.username = $scope.consultant.email;
            CreateConsultant.save($scope.consultant, function() {
             swal("Creación Extitosa");
            });
        }
        $scope.update=function(state){
            $scope.solicitud = Solicitud.get({ id: $scope.solicitud.id }, function() {
            $scope.solicitud.status = state;
            $scope.solicitud.manager = $localStorage.user;
            $scope.solicitud._id = $scope.solicitud.id;
            $scope.solicitud.$update();
            });
        }
    }];
    return {
        restrict : "EA",
        controller : controller,
        transclude : true,
        templateUrl : ("/static/templates/dashboard.html"),
        scope : {

        }
    }
}]);


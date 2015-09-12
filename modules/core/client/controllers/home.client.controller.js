'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/dashboard');
	}
]);

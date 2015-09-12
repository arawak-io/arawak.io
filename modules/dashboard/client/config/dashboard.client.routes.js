'use strict';

//Setting up route
angular.module('dashboard').config(['$stateProvider',
	function($stateProvider) {
		// Dashboard state routing
		$stateProvider.
		state('dashboard', {
			url: '/dashboard',
			templateUrl: 'modules/dashboard/views/dashboard.client.view.html'
		});
	}
]);
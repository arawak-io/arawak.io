'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		// Redirect to 404 when route not found
		$urlRouterProvider.otherwise('not-found');

		// Home state routing
		$stateProvider.
			state('home', {
				url: '/',
				templateUrl: 'modules/theme/views/home.client.view.html'
			}).
			state('not-found', {
				url: '/not-found',
				templateUrl: 'modules/theme/views/404.client.view.html'
			});
	}
]);

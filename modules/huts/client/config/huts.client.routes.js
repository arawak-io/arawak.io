'use strict';

//Setting up route
angular.module('huts').config(['$stateProvider',
	function($stateProvider) {
		// Huts state routing
		$stateProvider.
		state('huts', {
			abstract: true,
			url: '/huts',
			template: '<ui-view/>'
		}).
		state('huts.list', {
			url: '',
			templateUrl: 'modules/huts/views/list-huts.client.view.html'
		}).
		state('huts.create', {
			url: '/create',
			templateUrl: 'modules/huts/views/create-hut.client.view.html'
		}).
		state('huts.view', {
			url: '/:hutId',
			templateUrl: 'modules/huts/views/view-hut.client.view.html'
		}).
		state('huts.edit', {
			url: '/:hutId/edit',
			templateUrl: 'modules/huts/views/edit-hut.client.view.html'
		});
	}
]);
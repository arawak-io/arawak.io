'use strict';

(function() {
	// Huts Controller Spec
	describe('Huts Controller Tests', function() {
		// Initialize global variables
		var HutsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Huts controller.
			HutsController = $controller('HutsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Hut object fetched from XHR', inject(function(Huts) {
			// Create sample Hut using the Huts service
			var sampleHut = new Huts({
				name: 'New Hut'
			});

			// Create a sample Huts array that includes the new Hut
			var sampleHuts = [sampleHut];

			// Set GET response
			$httpBackend.expectGET('api/huts').respond(sampleHuts);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.huts).toEqualData(sampleHuts);
		}));

		it('$scope.findOne() should create an array with one Hut object fetched from XHR using a hutId URL parameter', inject(function(Huts) {
			// Define a sample Hut object
			var sampleHut = new Huts({
				name: 'New Hut'
			});

			// Set the URL parameter
			$stateParams.hutId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/huts\/([0-9a-fA-F]{24})$/).respond(sampleHut);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.hut).toEqualData(sampleHut);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Huts) {
			// Create a sample Hut object
			var sampleHutPostData = new Huts({
				name: 'New Hut'
			});

			// Create a sample Hut response
			var sampleHutResponse = new Huts({
				_id: '525cf20451979dea2c000001',
				name: 'New Hut'
			});

			// Fixture mock form input values
			scope.name = 'New Hut';

			// Set POST response
			$httpBackend.expectPOST('api/huts', sampleHutPostData).respond(sampleHutResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Hut was created
			expect($location.path()).toBe('/huts/' + sampleHutResponse._id);
		}));

		it('$scope.update() should update a valid Hut', inject(function(Huts) {
			// Define a sample Hut put data
			var sampleHutPutData = new Huts({
				_id: '525cf20451979dea2c000001',
				name: 'New Hut'
			});

			// Mock Hut in scope
			scope.hut = sampleHutPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/huts\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/huts/' + sampleHutPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid hutId and remove the Hut from the scope', inject(function(Huts) {
			// Create new Hut object
			var sampleHut = new Huts({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Huts array and include the Hut
			scope.huts = [sampleHut];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/huts\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleHut);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.huts.length).toBe(0);
		}));
	});
}());
'use strict';

(function() {
	// Servers Controller Spec
	describe('Servers Controller Tests', function() {
		// Initialize global variables
		var ServersController,
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

			// Initialize the Servers controller.
			ServersController = $controller('ServersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Server object fetched from XHR', inject(function(Servers) {
			// Create sample Server using the Servers service
			var sampleServer = new Servers({
				name: 'New Server'
			});

			// Create a sample Servers array that includes the new Server
			var sampleServers = [sampleServer];

			// Set GET response
			$httpBackend.expectGET('api/servers').respond(sampleServers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.servers).toEqualData(sampleServers);
		}));

		it('$scope.findOne() should create an array with one Server object fetched from XHR using a serverId URL parameter', inject(function(Servers) {
			// Define a sample Server object
			var sampleServer = new Servers({
				name: 'New Server'
			});

			// Set the URL parameter
			$stateParams.serverId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/servers\/([0-9a-fA-F]{24})$/).respond(sampleServer);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.server).toEqualData(sampleServer);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Servers) {
			// Create a sample Server object
			var sampleServerPostData = new Servers({
				name: 'New Server'
			});

			// Create a sample Server response
			var sampleServerResponse = new Servers({
				_id: '525cf20451979dea2c000001',
				name: 'New Server'
			});

			// Fixture mock form input values
			scope.name = 'New Server';

			// Set POST response
			$httpBackend.expectPOST('api/servers', sampleServerPostData).respond(sampleServerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Server was created
			expect($location.path()).toBe('/servers/' + sampleServerResponse._id);
		}));

		it('$scope.update() should update a valid Server', inject(function(Servers) {
			// Define a sample Server put data
			var sampleServerPutData = new Servers({
				_id: '525cf20451979dea2c000001',
				name: 'New Server'
			});

			// Mock Server in scope
			scope.server = sampleServerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/servers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/servers/' + sampleServerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid serverId and remove the Server from the scope', inject(function(Servers) {
			// Create new Server object
			var sampleServer = new Servers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Servers array and include the Server
			scope.servers = [sampleServer];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/servers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleServer);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.servers.length).toBe(0);
		}));
	});
}());
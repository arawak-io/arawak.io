'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Server = mongoose.model('Server'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, server;

/**
 * Server routes tests
 */
describe('Server CRUD tests', function() {
	before(function(done) {
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app);

		done();
	});

	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Server
		user.save(function() {
			server = {
				name: 'Server Name'
			};

			done();
		});
	});

	it('should be able to save Server instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Server
				agent.post('/api/servers')
					.send(server)
					.expect(200)
					.end(function(serverSaveErr, serverSaveRes) {
						// Handle Server save error
						if (serverSaveErr) done(serverSaveErr);

						// Get a list of Servers
						agent.get('/api/servers')
							.end(function(serversGetErr, serversGetRes) {
								// Handle Server save error
								if (serversGetErr) done(serversGetErr);

								// Get Servers list
								var servers = serversGetRes.body;

								// Set assertions
								(servers[0].user._id).should.equal(userId);
								(servers[0].name).should.match('Server Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Server instance if not logged in', function(done) {
		agent.post('/api/servers')
			.send(server)
			.expect(403)
			.end(function(serverSaveErr, serverSaveRes) {
				// Call the assertion callback
				done(serverSaveErr);
			});
	});

	it('should not be able to save Server instance if no name is provided', function(done) {
		// Invalidate name field
		server.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Server
				agent.post('/api/servers')
					.send(server)
					.expect(400)
					.end(function(serverSaveErr, serverSaveRes) {
						// Set message assertion
						(serverSaveRes.body.message).should.match('Please fill Server name');
						
						// Handle Server save error
						done(serverSaveErr);
					});
			});
	});

	it('should be able to update Server instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Server
				agent.post('/api/servers')
					.send(server)
					.expect(200)
					.end(function(serverSaveErr, serverSaveRes) {
						// Handle Server save error
						if (serverSaveErr) done(serverSaveErr);

						// Update Server name
						server.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Server
						agent.put('/api/servers/' + serverSaveRes.body._id)
							.send(server)
							.expect(200)
							.end(function(serverUpdateErr, serverUpdateRes) {
								// Handle Server update error
								if (serverUpdateErr) done(serverUpdateErr);

								// Set assertions
								(serverUpdateRes.body._id).should.equal(serverSaveRes.body._id);
								(serverUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Servers if not signed in', function(done) {
		// Create new Server model instance
		var serverObj = new Server(server);

		// Save the Server
		serverObj.save(function() {
			// Request Servers
			request(app).get('/api/servers')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Server if not signed in', function(done) {
		// Create new Server model instance
		var serverObj = new Server(server);

		// Save the Server
		serverObj.save(function() {
			request(app).get('/api/servers/' + serverObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', server.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Server instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Server
				agent.post('/api/servers')
					.send(server)
					.expect(200)
					.end(function(serverSaveErr, serverSaveRes) {
						// Handle Server save error
						if (serverSaveErr) done(serverSaveErr);

						// Delete existing Server
						agent.delete('/api/servers/' + serverSaveRes.body._id)
							.send(server)
							.expect(200)
							.end(function(serverDeleteErr, serverDeleteRes) {
								// Handle Server error error
								if (serverDeleteErr) done(serverDeleteErr);

								// Set assertions
								(serverDeleteRes.body._id).should.equal(serverSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Server instance if not signed in', function(done) {
		// Set Server user 
		server.user = user;

		// Create new Server model instance
		var serverObj = new Server(server);

		// Save the Server
		serverObj.save(function() {
			// Try deleting Server
			request(app).delete('/api/servers/' + serverObj._id)
			.expect(403)
			.end(function(serverDeleteErr, serverDeleteRes) {
				// Set message assertion
				(serverDeleteRes.body.message).should.match('User is not authorized');

				// Handle Server error error
				done(serverDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Server.remove().exec(function(){
				done();
			});
		});
	});
});

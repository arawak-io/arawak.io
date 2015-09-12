'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Hut = mongoose.model('Hut'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, hut;

/**
 * Hut routes tests
 */
describe('Hut CRUD tests', function() {
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

		// Save a user to the test db and create new Hut
		user.save(function() {
			hut = {
				name: 'Hut Name'
			};

			done();
		});
	});

	it('should be able to save Hut instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hut
				agent.post('/api/huts')
					.send(hut)
					.expect(200)
					.end(function(hutSaveErr, hutSaveRes) {
						// Handle Hut save error
						if (hutSaveErr) done(hutSaveErr);

						// Get a list of Huts
						agent.get('/api/huts')
							.end(function(hutsGetErr, hutsGetRes) {
								// Handle Hut save error
								if (hutsGetErr) done(hutsGetErr);

								// Get Huts list
								var huts = hutsGetRes.body;

								// Set assertions
								(huts[0].user._id).should.equal(userId);
								(huts[0].name).should.match('Hut Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Hut instance if not logged in', function(done) {
		agent.post('/api/huts')
			.send(hut)
			.expect(403)
			.end(function(hutSaveErr, hutSaveRes) {
				// Call the assertion callback
				done(hutSaveErr);
			});
	});

	it('should not be able to save Hut instance if no name is provided', function(done) {
		// Invalidate name field
		hut.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hut
				agent.post('/api/huts')
					.send(hut)
					.expect(400)
					.end(function(hutSaveErr, hutSaveRes) {
						// Set message assertion
						(hutSaveRes.body.message).should.match('Please fill Hut name');
						
						// Handle Hut save error
						done(hutSaveErr);
					});
			});
	});

	it('should be able to update Hut instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hut
				agent.post('/api/huts')
					.send(hut)
					.expect(200)
					.end(function(hutSaveErr, hutSaveRes) {
						// Handle Hut save error
						if (hutSaveErr) done(hutSaveErr);

						// Update Hut name
						hut.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Hut
						agent.put('/api/huts/' + hutSaveRes.body._id)
							.send(hut)
							.expect(200)
							.end(function(hutUpdateErr, hutUpdateRes) {
								// Handle Hut update error
								if (hutUpdateErr) done(hutUpdateErr);

								// Set assertions
								(hutUpdateRes.body._id).should.equal(hutSaveRes.body._id);
								(hutUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Huts if not signed in', function(done) {
		// Create new Hut model instance
		var hutObj = new Hut(hut);

		// Save the Hut
		hutObj.save(function() {
			// Request Huts
			request(app).get('/api/huts')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Hut if not signed in', function(done) {
		// Create new Hut model instance
		var hutObj = new Hut(hut);

		// Save the Hut
		hutObj.save(function() {
			request(app).get('/api/huts/' + hutObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', hut.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Hut instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hut
				agent.post('/api/huts')
					.send(hut)
					.expect(200)
					.end(function(hutSaveErr, hutSaveRes) {
						// Handle Hut save error
						if (hutSaveErr) done(hutSaveErr);

						// Delete existing Hut
						agent.delete('/api/huts/' + hutSaveRes.body._id)
							.send(hut)
							.expect(200)
							.end(function(hutDeleteErr, hutDeleteRes) {
								// Handle Hut error error
								if (hutDeleteErr) done(hutDeleteErr);

								// Set assertions
								(hutDeleteRes.body._id).should.equal(hutSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Hut instance if not signed in', function(done) {
		// Set Hut user 
		hut.user = user;

		// Create new Hut model instance
		var hutObj = new Hut(hut);

		// Save the Hut
		hutObj.save(function() {
			// Try deleting Hut
			request(app).delete('/api/huts/' + hutObj._id)
			.expect(403)
			.end(function(hutDeleteErr, hutDeleteRes) {
				// Set message assertion
				(hutDeleteRes.body.message).should.match('User is not authorized');

				// Handle Hut error error
				done(hutDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Hut.remove().exec(function(){
				done();
			});
		});
	});
});

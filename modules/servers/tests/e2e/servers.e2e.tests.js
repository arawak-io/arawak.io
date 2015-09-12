'use strict';

describe('Servers E2E Tests:', function() {
	describe('Test Servers page', function() {
		it('Should not include new Servers', function() {
			browser.get('http://localhost:3000/#!/servers');
			expect(element.all(by.repeater('server in servers')).count()).toEqual(0);
		});
	});
});

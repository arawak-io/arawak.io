'use strict';

describe('Huts E2E Tests:', function() {
	describe('Test Huts page', function() {
		it('Should not include new Huts', function() {
			browser.get('http://localhost:3000/#!/huts');
			expect(element.all(by.repeater('hut in huts')).count()).toEqual(0);
		});
	});
});

'use strict';

/*eslint-disable no-unused-vars*/

const chai = require('chai');
const should = chai.should();
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
const sinon = require('sinon');
require('sinon-as-promised');

describe('Default', () => {

    describe('#sample test', () => {
        it('should pass', () => {
            true.should.not.be.null;
        });
    });
});

/*eslint-enable no-unused-vars*/

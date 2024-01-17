import 'mocha';
import { assert } from 'chai';

import npmPackage from '..';
import { meaningOfLife } from '..';

describe('NPM Package', () => {
  it('should be an object', () => {
    assert.isObject(npmPackage);
  });

  it('should have a meaningOfLife property', () => {
    assert.property(npmPackage, 'meaningOfLife');
  });
});

describe('meaningOfLife Function', () => {
  it('should be a function', () => {
    assert.isFunction(meaningOfLife);
  });

  it('should return the meaning of life result', () => {
    const expected = 42;
    const actual = meaningOfLife();
    assert.equal(actual, expected);
  });
});

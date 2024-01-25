import 'mocha';
import { assert } from 'chai';

import OLAFSDK from '..';

describe('NPM Package', () => {
  it('should be an object', () => {
    assert.isFunction(OLAFSDK);
  });
});

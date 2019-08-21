import chai from 'chai';
import dirtyChai from 'dirty-chai';

chai.use(dirtyChai);

Object.assign(global, {
  expect: chai.expect
});

import normalise from '../normalise';
import test from 'tape';

test('#normalise', t => {
  t.deepEqual(normalise([{
    id: 1,
    stuff: true
  }, {
    id: 2,
    stuff: false
  }, {
    id: 3,
    stuff: true,
    moreStuff: true
  }]), {
    byId: {
      1: {
        id: 1,
        stuff: true
      },
      2: {
        id: 2,
        stuff: false
      },
      3: {
        id: 3,
        stuff: true,
        moreStuff: true
      }
    },
    items: [1,2,3]
  });

  t.end();
});

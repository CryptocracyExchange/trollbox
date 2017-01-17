const expect = require('chai').expect;
const sinon = require('sinon');
const testHelper = require('./tools/test-helper');
const connectionParams = require('./tools/connection-params');
const Deepstream = require('deepstream.io');

let server = null;

describe('Trollbox Provider', () => {
  let provider;
  let ds;

  before(() => {
  });

  before((done) => {
    server = new Deepstream();
    server.set('port', 7071);
    server.set('showLogo', false);
    server.set('logger', {
      setLogLevel: () => {},
      log: () => {},
      isReady: true
    });
    server.on('started', () => {
      done();
    });
    server.start();
  });

  after((done) => {
    server.on('stopped', done);
    server.stop();
  });

  it('starts', (done) => {
    testHelper.startProvider((_provider) => {
      provider = _provider;
      done();
    });
  });

  it('establishes a connection to deepstream', (done) => {
    testHelper.connectToDeepstream((err, _ds) => {
      ds = _ds;
      done(err);
    });
  });

  // it('inserts a new Spanish book and the search gets notified', (done) => {
  //   ds.record.getRecord('ohy').set({
  //     title: 'Cien años de soledad',
  //     author: 'Gabriel García Márquez',
  //     language: 'Spanish',
  //     released: 1967,
  //     copiesSold: 50000000
  //   })

  //   var update = false;
  //   var subscription = (arg) => {
  //     if (!update) {
  //       expect(arg).to.deep.equal(['don'])
  //       update = true
  //       return
  //     }

  //     expect(arg).to.deep.equal(['don', 'ohy'])
  //     spanishBooks.unsubscribe(subscription)
  //     spanishBooks.discard()
  //     done()
  //   }
  //   spanishBooks = ds.record.getList('search?' + spanishBooksQuery)
  //   spanishBooks.subscribe(subscription)
  // })

  // it('issues a search for all books published between 1700 and 1950', (done) => {
  //   var query = JSON.stringify({
  //     table: connectionParams.testTable,
  //     query: [
  //       ['released', 'gt', 1700],
  //       ['released', 'lt', 1950]
  //     ]
  //   })
  //   var subscription = (entries) => {
  //     expect(entries).to.deep.equal(['tct', 'tlp'])
  //     olderBooks.unsubscribe(subscription)
  //     olderBooks.discard()
  //     done()
  //   }
  //   var olderBooks = ds.record.getList('search?' + query)
  //   olderBooks.subscribe(subscription)
  // })

  // // TODO: it correctly handles an order field without an index

  // it('issues a search for the most recent book', (done) => {
  //   var query = JSON.stringify({
  //     table: connectionParams.testTable,
  //     query: [],
  //     order: 'released',
  //     desc: true,
  //     limit: 1
  //   })

  //   var update = false;
  //   var subscription = (arg) => {
  //     if (!update) {
  //       expect(arg).to.deep.equal(['hrp'])
  //       update = true

  //       ds.record.getRecord('twl').set({
  //         title: 'Twilight',
  //         author: 'Stephanie Meyer',
  //         language: 'English',
  //         released: 2005,
  //         copiesSold: 47000000
  //       })

  //       return
  //     }

  //     expect(arg).to.deep.equal(['twl']);
  //     recentBook.unsubscribe(subscription);
  //     recentBook.discard();
  //     done();
  //   };
  //   var recentBook = ds.record.getList('search?' + query);
  //   recentBook.subscribe(subscription);
  // });

  it('cleans up', (done) => {
    testHelper.cleanUp(provider, ds, done);
  });
});

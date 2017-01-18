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

  it('creates a listener for trollbox-create-message events', () => {
    provider._deepstreamClient.event.listen('trollbox-create-message', (eventName, isSubscribed, response) => {
      expect(isSubscribed).to.be.true;
    })
  });

  it('calls the callback in subscribe for each new event', (done) => {
    const callback = sinon.spy(() => {
      if (callback.callCount === 3) {
        done();
      }
    });
    provider._deepstreamClient.record
      .getList('trollbox-messages')
      .whenReady((messageList) => {
        messageList.subscribe(callback);
    });

    provider._deepstreamClient.event.emit('trollbox-create-message', {userID: 'testuser', content: 'Test message.'});
    provider._deepstreamClient.event.emit('trollbox-create-message', {userID: 'testuser', content: 'Test message.'});
    provider._deepstreamClient.event.emit('trollbox-create-message', {userID: 'testuser', content: 'Test message.'});
  });

  it('creates a new message on trollbox-create-message events', (done) => {
    provider._deepstreamClient.record
      .getList('trollbox-messages')
      .whenReady((messageList) => {
        messageList.subscribe((newList) => {
          provider._deepstreamClient.record.snapshot(newList[0], (err, messageData) => {
            expect(messageData.userID).to.equal('testuser');
            expect(messageData.content).to.equal('Test message.');
            expect(messageData.createdAt).not.to.be.null;
            done();
          })
        });
    });
    provider._deepstreamClient.event.emit('trollbox-create-message', {userID: 'testuser', content: 'Test message.'});
  });

  it('cleans up', (done) => {
    testHelper.cleanUp(provider, ds, done);
  });
});

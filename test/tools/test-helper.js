const connectionParams = require('./connection-params');
const Provider = require('../../src/trollboxClass');
const DeepstreamClient = require('deepstream.io-client-js');

exports.startProvider = (done) => {
  const provider = new Provider({
    logLevel: 0,
    deepstreamUrl: connectionParams.deepstreamUrl,
    deepstreamCredentials: connectionParams.deepstreamCredentials,
  });

  provider.on('ready', () => {
    done(provider);
  });

  provider.start();
};

exports.connectToDeepstream = (done) => {
  const ds = new DeepstreamClient(connectionParams.deepstreamUrl);
  ds.on('error', (message) => {
    console.log('ERROR on client', message);
  });
  ds.login({ username: 'testClient' }, (success) => {
    if (!success) {
      done(new Error('Could not connect'));
    } else {
      done(null, ds);
    }
  });
};

exports.cleanUp = (provider, deepstream, done) => {
  // FIXME: this is to wait for an unsubscription ACK - remove timeout when DS closes cleanly
  setTimeout(() => {
    provider.stop();
    deepstream.close();
    done();
  }, 100);
};

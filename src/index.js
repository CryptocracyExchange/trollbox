const TrollboxProvider = require('./trollboxClass');

const trollbox = new TrollboxProvider({
  /**
   * Only use 1 for production!
   * 0 = logging off
   * 1 = only log connection events & errors
   * 2 = also log subscriptions and discards
   * 3 = log outgoing messages
   */
  logLevel: process.env.NODE_ENV === 'prod' ? 1 : 3,
  deepstreamUrl: `${process.env.NODE_ENV === 'prod' ? 'deepstream' : 'localhost'}:6020`,
  deepstreamCredentials: process.env.NODE_ENV === 'prod' ? {
    role: process.env.DEEPSTREAM_AUTH_ROLE,
    username: process.env.DEEPSTREAM_AUTH_USERNAME,
    password: process.env.DEEPSTREAM_AUTH_PASSWORD
  } : {
    role: 'provider',
    username: 'trollbox-service',
    password: '12345'
  }
});

trollbox.start();

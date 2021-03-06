const DeepstreamClient = require('deepstream.io-client-js');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

let providerContext;
const Provider = function (config) {
  this.isReady = false;
  this._config = config;
  this._logLevel = config.logLevel !== undefined ? config.logLevel : 1;
  this._deepstreamClient = null;

  providerContext = this;
};

util.inherits(Provider, EventEmitter);

Provider.prototype.start = function () {
  this._initialiseDeepstreamClient();
};

Provider.prototype.stop = function () {
  this._deepstreamClient.close();
};

Provider.prototype.log = function (message, level) {
  if (this._logLevel < level) {
    return;
  }
  const date = new Date();
  const time = `${date.toLocaleTimeString()}:${date.getMilliseconds()}`;
  console.log(`${time}::Trollbox::${message}`);
};

Provider.prototype._initialiseDeepstreamClient = function () {
  this.log('Initialising Deepstream connection', 1);

  if (this._config.deepstreamClient) {
    this._deepstreamClient = this._config.deepstreamClient;
    this.log('Deepstream connection established', 1);
    this._ready();
  } else {
    if (!this._config.deepstreamUrl) {
      throw new Error('Can\'t connect to deepstream, neither deepstreamClient nor deepstreamUrl were provided', 1);
    }

    if (!this._config.deepstreamCredentials) {
      throw new Error('Missing configuration parameter deepstreamCredentials', 1);
    }

    this._deepstreamClient = new DeepstreamClient(this._config.deepstreamUrl);
    this._deepstreamClient.on('error', (error) => {
      console.log(error);
    });
    this._deepstreamClient.login(
      this._config.deepstreamCredentials,
      this._onDeepstreamLogin.bind(this)
      );
  }
};

Provider.prototype._onDeepstreamLogin = function (success, error, message) {
  if (success) {
    this.log('Connection to Deepstream established', 1);
    this._ready();
  } else {
    this.log(`Can't connect to Deepstream: ${message}`, 1);
  }
};

Provider.prototype._ready = function () {
  this._createNewMessageListener();
  this.log('Provider ready', 1);
  this.isReady = true;
  this.emit('ready');
};

Provider.prototype._createNewMessageListener = function () {
  this._deepstreamClient.event.subscribe('trollbox-create-message', (messageData) => {
    this._createNewMessage(messageData);
  });
};

Provider.prototype._createNewMessage = function (messageData) {
  const recordName = `trollbox/${this._deepstreamClient.getUid()}`;
  const newMessage = this._deepstreamClient.record.getRecord(recordName);
  newMessage.whenReady((messageRecord) => {
    newMessage.set({
      userID: messageData.userID,
      content: messageData.content,
      createdAt: Date.now()
    });
    this._addMessageToList(messageRecord.name);
  })
  newMessage.discard();
}

Provider.prototype._addMessageToList = function (recordName) {
  const messageList = this._deepstreamClient.record.getList('trollbox-messages');
  messageList.addEntry(recordName);
  messageList.discard();
};

module.exports = Provider;

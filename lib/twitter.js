const TwitterLite = require('twitter-lite').default;

class Twitter {
  constructor(consumerKey, consumerSecret, accessTokenKey, accessTokenSecret) {
    this.twitterClient = new TwitterLite({
      subdomain: 'api',
      version: '1.1',
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessTokenKey,
      access_token_secret: accessTokenSecret,
    });
  }

  async authenticate() {
    return this.twitterClient.get('account/verify_credentials');
  }

  async getTweet(id) {
    return this.twitterClient.get('statuses/show', {
      id,
    });
  }
}

module.exports.Twitter = Twitter;

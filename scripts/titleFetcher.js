// Description:
//   URL Title Displayer
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   None
//
// Notes:
//   Originally from https://github.com/halkeye/hubot-url-describer/
//   Copyright (c) 2013 Gavin Mogan
//   Licensed under the MIT license.
//
// Author:
//   halkeye
//   jrobeson

const axios = require('axios').default;
const { JSDOM } = require('jsdom');

const { Twitter } = require('../lib/twitter');

const regex = /https?:\/\/[^\s]+/g;

// the most minimal set of entities to transform
const unescapeHtmlEntities = (html) =>
  String(html)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x3A;/g, ':')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;|\u2014/g, '--');

const fetchDocument = async (url) => {
  try {
    const response = await axios.get(url, {
      maxContentLength: 10_485_760,
      responseType: 'document',
    });

    if (
      response.headers['content-type'] &&
      !response.headers['content-type'].includes('text/html')
    ) {
      throw new Error(
        `error fetching ${url}: invalid Content-Type ${response.headers['content-type']}, expected text/html`
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(`error fetching ${url}: ${error.message}`);
  }
};

const findTitleInDocument = (body) => {
  const { document } = new JSDOM(body).window;
  const title = [
    document.querySelector('meta[property="og:title"]')?.content,
    document.querySelector('title')?.textContent,
  ].find((content) => {
    return typeof content === 'string';
  });

  return title;
};

const formatTitle = (title) =>
  title
    .split(/\r\n|\n|\r/)
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' / ')
    .trim();

const configureTwitter = () => {
  if (
    typeof process.env.HUBOT_TWITTER_CONSUMER_KEY === 'undefined' ||
    typeof process.env.HUBOT_TWITTER_CONSUMER_SECRET === 'undefined' ||
    typeof process.env.HUBOT_TWITTER_ACCESS_TOKEN_KEY === 'undefined' ||
    typeof process.env.HUBOT_TWITTER_ACCESS_TOKEN_SECRET === 'undefined'
  ) {
    console.error(`error: missing one or more twitter configuration values`);
    return null;
  }

  return new Twitter(
    process.env.HUBOT_TWITTER_CONSUMER_KEY,
    process.env.HUBOT_TWITTER_CONSUMER_SECRET,
    process.env.HUBOT_TWITTER_ACCESS_TOKEN_KEY,
    process.env.HUBOT_TWITTER_ACCESS_TOKEN_SECRET
  );
};

const isTweet = (urlData) => {
  return urlData.hostname.includes('twitter.com') && urlData.pathname.includes('status');
};

const getTwitterStatusId = (path) => {
  const pathParts = path.split('/');
  if (pathParts.length < 2) return;
  return pathParts[1];
};

module.exports = async (robot) => {
  const twitterClient = configureTwitter();
  if (twitterClient) {
    try {
      await twitterClient.authenticate();
    } catch (error) {
      console.error(`error authenticating to twitter: ${error}`);
    }
  }
  robot.hear(regex, async (msg) => {
    msg.match.map(async (url) => {
      let urlData;
      try {
        urlData = new globalThis.URL(url);
      } catch {
        // If the url can't be parsed then there's nothing more to be done
        return;
      }

      let title = '';
      if (isTweet(urlData)) {
        if (twitterClient && getTwitterStatusId(urlData.pathname)) {
          try {
            const tweet = await twitterClient.getTweet(getTwitterStatusId(urlData.pathname));
            title = `${tweet.user.name} (@${tweet.user.screen_name}): ${tweet.text}`;
          } catch (error) {
            console.error(`error fetching tweet (${urlData.url}): ${error}`);
          }
        }
      } else {
        let responseBody = '';
        try {
          responseBody = await fetchDocument(url);
        } catch (error) {
          console.error(`error getting ${url}: ${error}`);
          return;
        }

        title = findTitleInDocument(responseBody);
      }

      if (!title) {
        console.error(`error finding title of ${url}: title is empty or non-existent`);
        return;
      }

      const formattedTitle = `${formatTitle(title)} - [${urlData.hostname}]`;
      return msg.send(unescapeHtmlEntities(formattedTitle));
    });
  });
};

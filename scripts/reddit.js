// Description:
//   Grab top non-stickied post of a subreddit.
//
// Dependencies:
//   reddit
//
// Configuration:
//   HUBOT_REDDIT_USERNAME
//   HUBOT_REDDIT_PASSWORD
//   HUBOT_REDDIT_APP_ID
//   HUBOT_REDDIT_APP_SECRET
//
// Commands:
//   hubot reddit [subreddit] - Displays top non-stickied post of [subreddit], defaults to r/popular
//
// Notes:
//   None.
//
// Author:
//   https://github.com/davidscholberg

const Reddit = require('reddit');

function configureReddit() {
  if (
    typeof process.env.HUBOT_REDDIT_USERNAME === 'undefined' ||
    typeof process.env.HUBOT_REDDIT_PASSWORD === 'undefined' ||
    typeof process.env.HUBOT_REDDIT_APP_ID === 'undefined' ||
    typeof process.env.HUBOT_REDDIT_APP_SECRET === 'undefined'
  ) {
    console.error(`error: missing one or more reddit configuration values`);
    return null;
  }
  return new Reddit({
    username: process.env.HUBOT_REDDIT_USERNAME,
    password: process.env.HUBOT_REDDIT_PASSWORD,
    appId: process.env.HUBOT_REDDIT_APP_ID,
    appSecret: process.env.HUBOT_REDDIT_APP_SECRET,
  });
}

module.exports = (robot) => {
  const reddit = configureReddit();

  robot.respond(/reddit( .+)?$/i, async (msg) => {
    if (reddit === null) {
      msg.send('oof, the reddit module is not configured properly :(');
      return;
    }
    const subredditMatch = msg.match[1];
    let subreddit = '';
    if (typeof subredditMatch !== 'undefined' && subredditMatch.trim() !== '') {
      subreddit = subredditMatch.trim();
    } else {
      subreddit = 'popular';
    }
    const apiPath = `/r/${encodeURIComponent(subreddit)}/hot`;
    try {
      const response = await reddit.get(apiPath);
      let postToShow = response.data.children[0].data;
      // filter out stickied posts if subreddit was specified
      if (subreddit !== 'popular') {
        for (let post of response.data.children) {
          if (!post.data.stickied) {
            postToShow = post.data;
            break;
          }
        }
      }
      msg.send(
        `${postToShow.title} - r/${postToShow.subreddit} - https://redd.it/${postToShow.id}`
      );
    } catch (error) {
      console.error(`error getting/displaying reddit data: ${error}`);
      msg.send('oof, there was a problem getting the reddit data :(');
    }
  });
};

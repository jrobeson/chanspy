// Description:
//   Adds quote functionality.
//
// Dependencies:
//   quote library (provided locally)
//
// Configuration:
//   None.
//
// Commands:
//   hubot grab <user> - store the user's last message in the quote database
//   hubot quote [user] - grab a random quote from the database
//
// Notes:
//   None.
//
// Author:
//   https://github.com/davidscholberg

const {
  initializeQuoteDatabase,
  cleanStaleLatestMessages,
  updateLatestMessage,
  storeLatestMessageAsQuote,
  retrieveQuote,
} = require('../lib/quote');

module.exports = async (robot) => {
  try {
    await initializeQuoteDatabase();

    setInterval(async () => {
      try {
        await cleanStaleLatestMessages();
      } catch (error) {
        console.error(`error cleaning stale latest messages: ${error}`);
      }
    }, 1000 * 60 * 10);

    robot.hear(/.*/, async (response) => {
      try {
        await updateLatestMessage(response.message.user.name, response.message.text);
      } catch (error) {
        console.error(`error updating latest message: ${error}`);
      }
    });

    robot.respond(/grab (.+)/i, async (response) => {
      try {
        const user = response.match[1].trim();
        if (user === response.message.user.name) {
          response.send(`pls do not grab yourself in public ಠ_ಠ`);
          return;
        }
        const success = await storeLatestMessageAsQuote(user);
        if (success) {
          response.send(`grabbed latest message from ${user}`);
        } else {
          response.send(`no entries found for "${user}"`);
        }
      } catch (error) {
        console.error(`error storing latest message as quote: ${error}`);
        response.send('oof, there was a database error :(');
      }
    });

    robot.respond(/quote ?(.*)/i, async (response) => {
      try {
        const user = response.match[1].trim();
        const quote = await retrieveQuote(user);
        if (quote === null) {
          let outputText = 'no entries found';
          if (user !== '') {
            outputText = `${outputText} for "${user}"`;
          }
          response.send(outputText);
        } else {
          response.send(`<${quote.user}> ${quote.text}`);
        }
      } catch (error) {
        console.error(`error retrieving quote from database: ${error}`);
        response.send('oof, there was a database error :(');
      }
    });
  } catch (error) {
    console.error(`error setting up quote module: ${error}`);
    robot.respond(/(grab|quote) /i, (response) => {
      response.send('oof, there was a problem setting up the quote module :(');
    });
  }
};

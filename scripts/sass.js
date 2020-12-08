// Description:
//   Adds some sassy replies to the bot.
//
// Dependencies:
//   None.
//
// Configuration:
//   None.
//
// Commands:
//   hubot <greeting> - Say hi to me!
//   hubot doing [subject] - celestial bodies are not doing, [subject] is doing
//
// Notes:
//   None.
//
// Author:
//   https://github.com/davidscholberg

module.exports = (robot) => {
  robot.hear(/^a[y]{2,}$/i, (msg) => {
    msg.send('lmao');
  });

  robot.respond(/(hi|hello|hey|greetings|hola|aloha)/i, (msg) => {
    msg.reply(`${msg.match[1]} (☛°ヮ°)☛`);
  });

  robot.respond(/(fu|fuck you|you suck|sucks)/i, (msg) => {
    msg.reply('(ಠ_ಠ)┌∩┐');
  });

  robot.respond(/doing( .+)?/i, (msg) => {
    let subject = msg.match[1];
    if (typeof subject === 'undefined' || subject.trim() === '') {
      subject = msg.message.user.name;
    }
    subject = subject.trim();
    const notDoing = ['sun is', 'stars are', 'trees are', 'moon is', 'planets are', 'galaxies are'];
    msg.send(`${msg.random(notDoing)} not doing, ${subject} is doing`);
  });
};

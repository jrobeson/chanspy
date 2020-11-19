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
//
// Notes:
//   None.
//
// Author:
//   https://github.com/davidscholberg

module.exports = function (robot) {
    robot.hear(/^a[y]{2,}$/i, function (msg) {
        msg.send('lmao');
    });

    robot.respond(/(hi|hello|hey|greetings|hola|aloha)/i, function (msg) {
        msg.reply(`${msg.match[1]} (☛°ヮ°)☛`);
    });

    robot.respond(/(fu|fuck you|you suck|sucks)/i, function (msg) {
        msg.reply('(ಠ_ಠ)┌∩┐');
    });
}

const { MessageEmbed } = require('discord.js');
const { xpToNextLvl, lvlsToNextPrestige } = require('../utils/levelling');

async function help(message) {
  const embed = new MessageEmbed().setColor('#6BF178').setTitle('Word Puzzle Bot Help');
  embed.addField('`' + 'wp! points' + '`', 'To view your overall stats and points');
  embed.addField('`' + 'wp! help' + '`', 'To view all the commands');
  embed.addField('`' + 'wp! channels' + '`', 'To view all the channels that are configured for the server');
  embed.addField('Only for users with the ' + '`' + 'MANAGE CHANNELS' + '`' + ' permission', 'Opt into channels with which you are okay with a puzzle randomly showing up in one of them!');
  embed.addField('`' + 'wp! channels add [CHANNEL ID]' + '`', 'To opt into a channel');
  embed.addField('`' + 'wp! channels del [CHANNEL ID]' + '`', 'To opt out of a channel');
  embed.addField('Levelling System', `Completing puzzles gives you some points. You level up when you get ${xpToNextLvl} points, and then your points go back to 0. Also, you get a higher prestige every ${lvlsToNextPrestige} levels!`);
  await message.channel.send(embed);
}

module.exports = help;

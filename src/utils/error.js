const { MessageEmbed } = require('discord.js');

function error(channel, err) {
  const embed = new MessageEmbed().setColor('#FF0000').setTitle(err);
  channel.send(embed);
}

module.exports = error;

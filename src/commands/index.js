const database = require('kvaluedb');
const prettyMilliseconds = require('pretty-ms');
const manageChannels = require('./manageChannels');
const { embedPointCard } = require('./points');
const { MessageEmbed } = require('discord.js');
const help = require('./help');
const { prestige } = require('../utils/levelling');
const { xpToNextLvl } = require('../utils/levelling');
const error = require('../utils/error');

const prefix = 'wp!';

async function commandHandler(message) {
  if (message.author.bot) return;

  const puzzle = database.get('puzzle');
  with (puzzle) {
    if (message.channel.id == channelId && message.guild.id == guildId && answer.includes(message.content.toLowerCase())) {
      if (database.get('puzzleSolved')) {
        const embed = new MessageEmbed().setColor('#80ED99').setTitle('This puzzle has already been solved! Wait for a new one to appear!');
        return message.channel.send(embed);
      }
      // prettier-ignore
      const { createdAt, author, author: { id, username } } = message;
      const avatarUrl = author.avatarURL();
      const timeTaken = prettyMilliseconds(Date.parse(createdAt) - timestamp);
      const embed = new MessageEmbed().setColor('#80ED99').setAuthor(`${username} got ${points} points!`, avatarUrl).setTimestamp().setFooter('Great job!');
      if (type == 'unscramble') {
        embed.setDescription(`${username} unscrambled the word ` + '`' + word + '`' + ` in ${timeTaken}!`);
      } else if (type == 'type') {
        embed.setDescription(`${username} typed the word ` + '`' + word + '`' + ` in ${timeTaken}!`);
      }
      await message.channel.send(embed);
      const userData = database.get('userdata');
      let user;
      if (userData[id]) {
        user = userData[id];
        user.points += points;
        if (user.points >= xpToNextLvl) {
          user.level++;
          user.points = user.points - xpToNextLvl;
        }
      } else {
        user = { points, level: 1 };
      }
      user.prestige = prestige(user.level);
      userData[id] = user;
      database.set('userdata', userData);
      database.set('puzzleSolved', true);
    }
  }

  if (!message.content.startsWith(prefix)) return;
  const args = message.content.split(/\s+/);
  args.shift();
  const command = args.shift();
  if (command == 'channels') {
    await manageChannels(message, args);
  } else if (command == 'points') {
    const user = args[0];
    await embedPointCard(message, user);
  } else if (command == 'help') {
    await help(message);
  } else {
    error(message.channel, 'Could not find that command!');
  }
}

module.exports = commandHandler;

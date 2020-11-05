const database = require('kvaluedb');
const { MessageEmbed } = require('discord.js');
const error = require('../utils/error');

async function manageChannels(message, args) {
  const { guild, channel } = message;
  const serverId = guild.id;
  const allChannels = database.get('channels');
  const channels = allChannels[serverId];
  if (!args.length) {
    const embed = new MessageEmbed()
      .setColor('#1AC8ED')
      .setTitle('Configured Channels for this Server')
      .setDescription(channels && channels.length ? getChannelNames(guild, channels) : 'No channels configured');
    await message.channel.send(embed);
  } else {
    if (!guild.members.resolve(message.author.id).hasPermission('MANAGE_CHANNELS')) {
      return error(channel, 'Only a user with the `MANAGE CHANNELS` permisison can use this command!');
    }
    if (!['add', 'del'].includes(args[0])) {
      return error(channel, 'Could not find that command!');
    }
    const id = args[1];
    if (!id) {
      return error(channel, 'You have to provide a channel id!');
    } else if (invalidChannel(guild, id)) {
      return error(channel, 'Could not find a text channel with the provided id!');
    }
    const newChannels = channels || [];
    if (args[0] == 'add') {
      if (!newChannels.includes(id)) {
        newChannels.push(id);
      }
    } else if (args[0] == 'del') {
      const index = newChannels.indexOf(id);
      if (index >= 0) {
        newChannels.splice(index, 1);
      }
    }
    if (['add', 'del'].includes(args[0])) {
      const embed = new MessageEmbed()
        .setColor('#1AC8ED')
        .setTitle(`${args[0] == 'add' ? 'Added' : 'Deleted'} Channel`)
        .setDescription(`${getChannelName(guild, id)} - ${id}`);
      await message.channel.send(embed);
    }
    allChannels[serverId] = newChannels;
    database.set('channels', allChannels);
  }
}

function invalidChannel(guild, id) {
  const channel = guild.channels.resolve(id);
  let invalidChannel = true;
  if (channel && channel.isText()) {
    invalidChannel = false;
  }
  return invalidChannel;
}

function getChannelName(guild, id) {
  const channel = guild.channels.resolve(id);
  return channel.name;
}

function getChannelNames(guild, channels) {
  let str = '';
  for (let channelId of channels) {
    channelName = getChannelName(guild, channelId);
    str += `${channelName} (${channelId})\n`;
  }
  return str;
}

module.exports = manageChannels;

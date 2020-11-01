const database = require('kvaluedb');
const { MessageEmbed } = require('discord.js');

async function manageChannels(message, args) {
  const { guild } = message;
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
    const errorEmbed = new MessageEmbed().setColor('#FF0000');
    if (!guild.members.resolve(message.author.id).hasPermission('MANAGE_CHANNELS')) {
      errorEmbed.setTitle('Only a user with the `MANAGE CHANNELS` permisison can use this command!');
      return await message.channel.send(errorEmbed);
    }
    if (!['add', 'del'].includes(args[0])) {
      errorEmbed.setTitle('Could not find that command!');
      return await message.channel.send(errorEmbed);
    }
    const id = args[1];
    if (!id) {
      errorEmbed.setTitle('You have to provide a channel id!');
      return await message.channel.send(errorEmbed);
    } else if (invalidChannel(guild, id)) {
      errorEmbed.setTitle('Could not find a text channel with the provided id!');
      return await message.channel.send(errorEmbed);
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

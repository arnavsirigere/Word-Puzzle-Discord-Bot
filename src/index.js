require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const database = require('kvaluedb');
const rita = require('rita');
const randomWord = require('random-words');
const commandHandler = require('./commands');
const puzzleTypes = require('./utils/puzzle');

client.once('ready', async () => {
  console.log('Discord Bot is starting!');
  checkForNewPuzzle();
});

client.on('message', commandHandler);

client.login(process.env.BOT_TOKEN);

async function newPuzzle() {
  const allChannels = database.get('channels');
  const guilds = Object.keys(allChannels);
  const guildId = random(guilds);
  const channelId = random(allChannels[guildId]);
  const channel = client.guilds.resolve(guildId).channels.resolve(channelId);
  const { puzzle, puzzleEmbed } = createPuzzle();
  puzzle.guildId = guildId;
  puzzle.channelId = channelId;
  await channel.send(puzzleEmbed);
  database.set('puzzle', puzzle);
  database.set('puzzleSolved', false);
}

function createPuzzle() {
  const type = random(puzzleTypes);
  const timestamp = Date.now();
  const puzzleEmbed = new Discord.MessageEmbed().setColor('#80ED99').setTitle('New puzzle!').setTimestamp().setFooter('Good luck!');
  let points, answer, word;
  if (type == 'unscramble') {
    word = randomWord();
    points = word.length * 10;
    answer = [word];
    puzzleEmbed.setDescription('First person to unscramble the word ' + '`' + shuffle(word) + '`' + ` gets ${points} points!`);
  } else if (type == 'type') {
    word = rita.randomWord();
    points = 50;
    answer = [word];
    puzzleEmbed.setDescription('First person to type ' + '`' + word + '`' + ` gets ${points} points`);
  }
  // prettier-ignore
  const puzzle = { type, word, answer, points, timestamp };
  return { puzzle, puzzleEmbed };
}

function shuffle(str) {
  // prettier-ignore
  return str.split('').sort(() => 0.5 - Math.random()).join('');
}

// Function to pick random element from array
function random(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

setInterval(checkForNewPuzzle, 60 * 60 * 1000);

function checkForNewPuzzle() {
  if (database.get('puzzleSolved')) {
    newPuzzle();
  }
}

// Keeping the bot alive
const keepAlive = require('../server');
keepAlive();

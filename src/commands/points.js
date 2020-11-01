const path = require('path');
const { createCanvas, registerFont, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js');
const database = require('kvaluedb');
const { getFillStyle } = require('../utils/levelling');
const { xpToNextLvl } = require('../utils/levelling');

async function embedPointCard(message) {
  const userData = database.get('userdata')[message.author.id];
  const user = message.guild.members.resolve(message.author.id);
  registerFont(path.join(__dirname, '../../fonts/sans-serif.ttf'), { family: 'sans-serif' });
  const canvas = createCanvas(700, 250);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1f2525a0';
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 125);
  ctx.fillStyle = '#090b0b';
  const gap = 20;
  roundRect(ctx, gap, gap, canvas.width - gap * 2, canvas.height - gap * 2, 125);
  // Level, points and prestige
  const level = userData ? userData.level : 0;
  const points = userData ? userData.points : 0;
  const prestige = userData ? userData.prestige : 'None';
  ctx.fillStyle = getFillStyle(prestige);
  ctx.font = '32px sans-serif';
  ctx.fillText(`Prestige: ${prestige}`, canvas.width / 3 + 50, 70);
  ctx.font = '28px sans-serif';
  ctx.fillText(`Level: ${level}`, canvas.width / 3 + 50, 110);
  ctx.fillText(`Points: ${points}`, canvas.width / 3 + 50, 150);
  // Full Bar
  ctx.fillStyle = '#1f2525a0';
  const start = canvas.width / 3;
  const end = canvas.width - canvas.width / 6 - start;
  const y = 170;
  roundRect(ctx, start, y, end, 20, 25);
  // Xp Bar
  const w = map(points, 0, xpToNextLvl, 0, end);
  ctx.fillStyle = '#41EAD4';
  roundRect(ctx, start, y, w, 20, 25);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = getFillStyle(prestige);
  if (points > 0) {
    ctx.fillText(format(points), start + w - 26, y + 50);
  }
  ctx.fillText(format(xpToNextLvl), canvas.width - canvas.width / 6 + 15, y + 17);
  // User profile image
  ctx.save();
  ctx.fillStyle = '#090b0b';
  ctx.beginPath();
  ctx.arc(125, 125, 100 / 1.25, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.clip();
  const profileUrl = user.user.displayAvatarURL({ format: 'png' });
  const avatar = await loadImage(profileUrl);
  ctx.drawImage(avatar, 25 * 1.75, 25 * 1.75, 200 / 1.25, 200 / 1.25);
  ctx.restore();
  const attachment = new MessageAttachment(canvas.toBuffer(), 'rank_card.png');
  message.channel.send(attachment);
}

function format(val) {
  if (val < 1000) {
    return val;
  }
  const num = val / 1000;
  return `${num.toString().charAt(2) == '0' ? num.toFixed(2) : num}k`;
}

function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

function roundRect(ctx, x, y, w, h, r = 0) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.fill();
  return ctx;
}

module.exports = { xpToNextLvl, embedPointCard };

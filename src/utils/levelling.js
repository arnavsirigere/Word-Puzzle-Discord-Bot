const prestiges = ['None', 'Silver'];
const lvlsToNextPrestige = 50;
const xpToNextLvl = 3000;

function prestige(lvl) {
  const index = Math.floor(lvl / lvlsToNextPrestige);
  return prestiges[index];
}

function getFillStyle(prestige) {
  const fillStyles = ['#808080', '#ffffff'];
  const index = prestiges.indexOf(prestige);
  return fillStyles[index];
}

module.exports = { prestige, getFillStyle, xpToNextLvl, lvlsToNextPrestige };

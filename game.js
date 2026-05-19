const SAVE_KEY = "lucasMiningAdventureWebSave";
const AUDIO_KEY = "lucasMiningAdventureWebAudio";

const REBIRTH_MULTIPLIER_STEP = 0.25;
const UPGRADE_POWER_STEP = 0.25;
const UPGRADE_BASE_COST = 35;
const UPGRADE_COST_MULTIPLIER = 1.5;
const PET_AUTO_GAIN_FACTOR = 0.05;
const CRAB_FIND_INTERVAL = 10;
const AUTO_CLICKER_UNLOCK_REBIRTHS = 2;
const AUTO_CLICKER_COST = 1_000_000;
const AUTO_CLICKER_INTERVAL = 1.0;
const IDLE_DELAY = 5.0;
const MUSIC_VOLUME = 0.018;
const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;

const ORES = [
  { name: "Stone", unlock: 0, value: 1, color: "#777982", dark: "#4e5058" },
  { name: "Copper", unlock: 50, value: 4, color: "#c06a31", dark: "#79442c" },
  { name: "Iron", unlock: 500, value: 14, color: "#8b9296", dark: "#555b60" },
  { name: "Silver", unlock: 5_000, value: 70, color: "#cbd4d8", dark: "#808a90" },
  { name: "Gold", unlock: 50_000, value: 350, color: "#f5c33a", dark: "#9b6f24" },
  { name: "Diamond", unlock: 500_000, value: 1_400, color: "#63e1ef", dark: "#2b88a0" },
  { name: "Emerald", unlock: 5_000_000, value: 7_000, color: "#38d47a", dark: "#23794e" },
  { name: "Ruby", unlock: 50_000_000, value: 35_000, color: "#dc3e52", dark: "#842234" },
];

const MAPS = [
  { name: "Beach Island", rebirths: 0, boost: 1.0 },
  { name: "Volcano Cave", rebirths: 2, boost: 1.5 },
  { name: "Crystal Ocean", rebirths: 4, boost: 2.0 },
  { name: "Sky Island", rebirths: 6, boost: 2.5 },
];

// Pet data lives here so prices, unlocks, and abilities stay easy to tune.
const PETS_CONFIG = [
  { key: "turtle", name: "Turtle", gems: 30, message: "New Turtle pet!" },
  { key: "crab", name: "Beach Crab", gems: 150, message: "Beach Crab joined!" },
  {
    key: "dragon",
    name: "Baby Volcano Dragon",
    gems: 500,
    requiredMap: "Volcano Cave",
    bonusMultiplier: 0.1,
    message: "Baby Volcano Dragon joined!",
  },
];

const LUCAS_STAGES = [
  {
    name: "Beginner",
    shirt: "#268ede",
    shirtDark: "#1856a4",
    shirtLight: "#4eb4f5",
    pants: "#264c8e",
    boots: "#362c26",
    bootTrim: "#362c26",
    backpack: "#685848",
    backpackTrim: "#aa8452",
    glove: "#e2daca",
    belt: "#78502a",
    pickHandle: "#80502e",
    pickHead: "#4e4e58",
    pickHighlight: "#a0a0aa",
    aura: null,
  },
  {
    name: "Miner",
    shirt: "#247bc3",
    shirtDark: "#134d86",
    shirtLight: "#63b7e9",
    pants: "#203f78",
    boots: "#251f1d",
    bootTrim: "#6d4b2e",
    backpack: "#7a4d2b",
    backpackTrim: "#c07a3b",
    glove: "#d8d0bf",
    belt: "#6a4125",
    pickHandle: "#9a5b2e",
    pickHead: "#9a8b7a",
    pickHighlight: "#c9b59e",
    aura: null,
  },
  {
    name: "Treasure Hunter",
    shirt: "#1fa0ec",
    shirtDark: "#0e67b5",
    shirtLight: "#7bdcff",
    pants: "#1c4f9a",
    boots: "#2d241d",
    bootTrim: "#f2c24b",
    backpack: "#6f4b2e",
    backpackTrim: "#4ee8f2",
    glove: "#fff0cc",
    belt: "#8b5a26",
    pickHandle: "#a86d2f",
    pickHead: "#f2c24b",
    pickHighlight: "#8beeff",
    aura: null,
  },
  {
    name: "Legend Miner",
    shirt: "#3eb7ff",
    shirtDark: "#2550a8",
    shirtLight: "#d5fbff",
    pants: "#23337a",
    boots: "#211b2c",
    bootTrim: "#76efff",
    backpack: "#4b3b83",
    backpackTrim: "#ffe36b",
    glove: "#fff6dc",
    belt: "#f1c553",
    pickHandle: "#9b6f3a",
    pickHead: "#76efff",
    pickHighlight: "#fff7a6",
    aura: "rgba(118, 239, 255, 0.18)",
  },
];

const defaultState = () => ({
  coins: 0,
  gems: 0,
  clickLevel: 1,
  rebirths: 0,
  pets: 0,
  ownedPets: [],
  oreProgress: 0,
  currentMapIndex: 0,
  autoClickerOwned: false,
  totalMines: 0,
});

let state = defaultState();
let autoTimer = 0;
let crabTimer = 0;
let messageTimer = 0;
let message = "Mine to start your adventure!";
let minePulse = 0;
let floatTexts = [];
let mineParticles = [];
let lastTime = performance.now();
let lastActionTime = performance.now() / 1000;
let audioOn = localStorage.getItem(AUDIO_KEY) !== "off";
let audioCtx = null;
let musicTimer = null;
let musicStep = 0;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const gameShell = document.querySelector(".game-shell");
const particleLayer = document.getElementById("particleLayer");

const el = {
  coins: document.getElementById("coinsText"),
  gems: document.getElementById("gemsText"),
  level: document.getElementById("levelText"),
  perMine: document.getElementById("perMineText"),
  rebirth: document.getElementById("rebirthText"),
  multiplier: document.getElementById("multiplierText"),
  pets: document.getElementById("petsText"),
  ore: document.getElementById("oreText"),
  nextOre: document.getElementById("nextOreText"),
  map: document.getElementById("currentMapText"),
  mapBoost: document.getElementById("mapBoostText"),
  rebirthNeedStat: document.getElementById("rebirthNeedStat"),
  goal: document.getElementById("goalText"),
  save: document.getElementById("saveText"),
  message: document.getElementById("messageText"),
  upgradeCost: document.getElementById("upgradeCostText"),
  petCost: document.getElementById("petCostText"),
  rebirthCost: document.getElementById("rebirthCostText"),
  mapStatus: document.getElementById("mapStatusText"),
  autoStatus: document.getElementById("autoStatusText"),
};

const btn = {
  mine: document.getElementById("mineBtn"),
  upgrade: document.getElementById("upgradeBtn"),
  pet: document.getElementById("petBtn"),
  rebirth: document.getElementById("rebirthBtn"),
  map: document.getElementById("mapBtn"),
  auto: document.getElementById("autoBtn"),
  save: document.getElementById("saveBtn"),
  newGame: document.getElementById("newGameBtn"),
  audio: document.getElementById("audioBtn"),
};

function ensureAudio() {
  if (!audioOn) return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(frequency, duration, type = "sine", volume = 0.055, startOffset = 0) {
  const ctxAudio = ensureAudio();
  if (!ctxAudio) return;
  const start = ctxAudio.currentTime + startOffset;
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctxAudio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function scheduleMusicNote(frequency, startOffset, duration = 0.42) {
  const ctxAudio = ensureAudio();
  if (!ctxAudio) return;
  const start = ctxAudio.currentTime + startOffset;
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(MUSIC_VOLUME, start + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctxAudio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}

function musicTick() {
  if (!audioOn || !audioCtx) return;
  const melody = [262, 330, 392, 330, 294, 349, 440, 349];
  const bass = [131, 147, 165, 147];
  scheduleMusicNote(melody[musicStep % melody.length], 0, 0.55);
  if (musicStep % 2 === 0) scheduleMusicNote(bass[(musicStep / 2) % bass.length], 0.02, 0.8);
  musicStep += 1;
}

function startMusic() {
  if (!audioOn || musicTimer) return;
  const ctxAudio = ensureAudio();
  if (!ctxAudio) return;
  musicTick();
  musicTimer = window.setInterval(musicTick, 850);
}

function stopMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

function playMineSound() {
  playTone(145, 0.07, "triangle", 0.052);
  playTone(92, 0.055, "sine", 0.03, 0.025);
}

function playUpgradeSound() {
  playTone(520, 0.09, "sine", 0.04);
  playTone(660, 0.08, "sine", 0.032, 0.07);
}

function playRebirthSound() {
  playTone(420, 0.16, "sine", 0.042);
  playTone(560, 0.17, "sine", 0.036, 0.11);
  playTone(720, 0.20, "sine", 0.03, 0.24);
}

function playPetSound() {
  playTone(480, 0.075, "sine", 0.036);
  playTone(620, 0.085, "sine", 0.032, 0.06);
}

function handleUserAudio() {
  // 浏览器会限制自动播放；任何按钮第一次被点击时，都先尝试解锁 AudioContext
  lastActionTime = performance.now() / 1000;
  ensureAudio();
  startMusic();
}

function updateAudioButton() {
  btn.audio.textContent = audioOn ? "Audio: ON" : "Audio: OFF";
  if (!audioOn) stopMusic();
}

function formatNumber(value) {
  const abs = Math.abs(value);
  const units = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [amount, suffix] of units) {
    if (abs >= amount) return `${trim(value / amount)}${suffix}`;
  }
  return trim(value);
}

function trim(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  const abs = Math.abs(number);
  if (Math.abs(number - Math.round(number)) < 0.005) return String(Math.round(number));
  return number
    .toFixed(abs >= 100 ? 0 : abs >= 10 ? 1 : 2)
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "");
}

function rebirthMultiplier() {
  return 1 + state.rebirths * REBIRTH_MULTIPLIER_STEP;
}

function upgradeMultiplier() {
  return 1 + (state.clickLevel - 1) * UPGRADE_POWER_STEP;
}

function unlockedMaps() {
  return MAPS.filter((map) => state.rebirths >= map.rebirths);
}

function currentMap() {
  const maps = unlockedMaps();
  if (state.currentMapIndex >= maps.length) state.currentMapIndex = Math.max(0, maps.length - 1);
  return maps[state.currentMapIndex] || MAPS[0];
}

function nextMap() {
  return MAPS.find((map) => state.rebirths < map.rebirths) || null;
}

function isMapUnlocked(mapName) {
  const map = MAPS.find((item) => item.name === mapName);
  return !map || state.rebirths >= map.rebirths;
}

function normalizePets() {
  if (!Array.isArray(state.ownedPets)) state.ownedPets = [];
  state.ownedPets = state.ownedPets.filter((key, index, list) => PETS_CONFIG.some((pet) => pet.key === key) && list.indexOf(key) === index);

  // Old web saves only stored a number named pets. Keep them compatible by turning that old Turtle count into owned pets.
  if (state.ownedPets.length === 0 && Number(state.pets) > 0) {
    const oldPetCount = Math.min(Number(state.pets) || 0, PETS_CONFIG.length);
    for (let i = 0; i < oldPetCount; i++) state.ownedPets.push(PETS_CONFIG[i].key);
  }
  state.pets = state.ownedPets.length;
}

function ownsPet(key) {
  normalizePets();
  return state.ownedPets.includes(key);
}

function nextPetToBuy() {
  normalizePets();
  return PETS_CONFIG.find((pet) => !state.ownedPets.includes(pet.key)) || null;
}

function petPurchaseStatus() {
  const pet = nextPetToBuy();
  if (!pet) return { pet: null, locked: true, text: "All Pets Owned", message: "All Pets Owned" };
  if (pet.requiredMap && !isMapUnlocked(pet.requiredMap)) {
    return { pet, locked: true, text: "Unlock Volcano Cave first", message: "Unlock Volcano Cave first" };
  }
  if (state.gems < pet.gems) {
    return { pet, locked: true, text: `${pet.name}: ${pet.gems} gems`, message: "Need more gems!" };
  }
  return { pet, locked: false, text: `${pet.name}: ${pet.gems} gems`, message: "" };
}

function petBonusMultiplier() {
  return PETS_CONFIG.reduce((total, pet) => total + (ownsPet(pet.key) ? pet.bonusMultiplier || 0 : 0), 1);
}

function currentOre() {
  return ORES.filter((ore) => state.oreProgress >= ore.unlock).at(-1) || ORES[0];
}

function currentOreIndex() {
  return Math.max(0, ORES.findIndex((ore) => ore.name === currentOre().name));
}

function nextOre() {
  return ORES.find((ore) => state.oreProgress < ore.unlock) || null;
}

function getLucasEquipmentStage() {
  const oreIndex = currentOreIndex();
  if (state.rebirths >= 2 || currentMap().name === "Sky Island" || oreIndex >= 5) return LUCAS_STAGES[3];
  if (state.clickLevel >= 6 || oreIndex >= 4) return LUCAS_STAGES[2];
  if (state.clickLevel >= 3 || oreIndex >= 2) return LUCAS_STAGES[1];
  return LUCAS_STAGES[0];
}

function perMine() {
  return currentOre().value * upgradeMultiplier() * rebirthMultiplier() * currentMap().boost * petBonusMultiplier();
}

function upgradeCost() {
  return Math.floor(UPGRADE_BASE_COST * UPGRADE_COST_MULTIPLIER ** (state.clickLevel - 1));
}

function rebirthCost() {
  return Math.floor(500 * 1.8 ** state.rebirths);
}

function petAutoPerSecond() {
  normalizePets();
  return state.pets * currentOre().value * rebirthMultiplier() * PET_AUTO_GAIN_FACTOR;
}

function setMessage(text, seconds = 1.5) {
  message = text;
  messageTimer = seconds;
  el.message.textContent = text;
}

function addFloat(text, x, y, color = "#fff") {
  floatTexts.push({ text, x, y, life: 1, color });
}

function mine(automatic = false, clickPoint = null) {
  if (!automatic) handleUserAudio();
  const mobile = isMobileLayout();
  const gain = perMine();
  state.coins += gain;
  state.oreProgress += gain;
  state.gems += 0.03 * rebirthMultiplier();
  state.totalMines += 1;
  minePulse = 0.25;
  if (!automatic) {
    btn.mine.classList.add("mine-hit");
    window.setTimeout(() => btn.mine.classList.remove("mine-hit"), 120);
  }
  addFloat(`+$${formatNumber(gain)}`, 565, 310, "#ffe36b");
  addMineParticles(610, 360, automatic ? 3 : mobile ? 4 : 6, currentOre());
  if (!automatic && clickPoint) addFrontParticles(clickPoint.layerX, clickPoint.layerY, mobile ? 5 : 8, currentOre());
  else addMineParticles(480, 448, automatic ? 1 : mobile ? 3 : 5, currentOre());
  if (automatic && state.totalMines % 4 === 0) setMessage("Auto Clicker mined!");
  if (!automatic) playMineSound();
  updateUI();
}

function buyUpgrade() {
  handleUserAudio();
  const cost = upgradeCost();
  if (state.coins < cost) return setMessage("Need more coins!");
  state.coins -= cost;
  state.clickLevel += 1;
  setMessage("Pickaxe upgraded!");
  playUpgradeSound();
  updateUI();
}

function buyPet() {
  handleUserAudio();
  const status = petPurchaseStatus();
  if (status.locked) return setMessage(status.message);
  state.gems -= status.pet.gems;
  state.ownedPets.push(status.pet.key);
  normalizePets();
  setMessage(status.pet.message);
  playPetSound();
  updateUI();
}

function rebirth() {
  handleUserAudio();
  const cost = rebirthCost();
  if (state.coins < cost) return setMessage("Not enough coins");
  state.coins -= cost;
  state.rebirths += 1;
  state.clickLevel = 1;
  state.oreProgress = 0;
  setMessage("Reborn Stronger!", 2);
  playRebirthSound();
  updateUI();
}

function switchMap() {
  handleUserAudio();
  const maps = unlockedMaps();
  if (maps.length <= 1) {
    const locked = nextMap();
    return setMessage(locked ? `Unlock at ${locked.rebirths} Rebirths` : "All maps unlocked!");
  }
  state.currentMapIndex = (state.currentMapIndex + 1) % maps.length;
  setMessage(`Map: ${currentMap().name}`);
  updateUI();
}

function buyAutoClicker() {
  handleUserAudio();
  if (state.rebirths < AUTO_CLICKER_UNLOCK_REBIRTHS) return setMessage(`Auto Clicker unlocks at ${AUTO_CLICKER_UNLOCK_REBIRTHS} Rebirths.`);
  if (state.autoClickerOwned) return setMessage("Auto Clicker is ON!");
  if (state.coins < AUTO_CLICKER_COST) return setMessage("Need 1M coins!");
  state.coins -= AUTO_CLICKER_COST;
  state.autoClickerOwned = true;
  autoTimer = 0;
  setMessage("Auto Clicker unlocked!");
  updateUI();
}

function saveGame() {
  handleUserAudio();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  el.save.textContent = "Game Saved!";
  setMessage("Game Saved!");
}

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (saved && typeof saved === "object") state = { ...defaultState(), ...saved };
  } catch {
    state = defaultState();
  }
  normalizePets();
}

function newGame() {
  handleUserAudio();
  const ok = window.confirm("Are you sure?\nThis will erase current progress.");
  if (!ok) return;
  localStorage.removeItem(SAVE_KEY);
  state = defaultState();
  autoTimer = 0;
  crabTimer = 0;
  setMessage("New Game started!");
  updateUI();
}

function updateUI() {
  const ore = currentOre();
  const next = nextOre();
  const map = currentMap();
  const lockedMap = nextMap();
  const canUpgrade = state.coins >= upgradeCost();
  const petStatus = petPurchaseStatus();
  const canRebirth = state.coins >= rebirthCost();
  const canSwitchMap = unlockedMaps().length > 1;
  const autoUnlocked = state.rebirths >= AUTO_CLICKER_UNLOCK_REBIRTHS;
  const canAuto = state.autoClickerOwned || (autoUnlocked && state.coins >= AUTO_CLICKER_COST);

  el.coins.textContent = `$${formatNumber(state.coins)}`;
  el.gems.textContent = formatNumber(state.gems);
  el.level.textContent = state.clickLevel;
  el.perMine.textContent = `$${formatNumber(perMine())}`;
  el.rebirth.textContent = state.rebirths;
  el.multiplier.textContent = `${formatNumber(rebirthMultiplier())}x`;
  el.rebirthNeedStat.textContent = `$${formatNumber(rebirthCost())}`;
  el.pets.textContent = `${state.pets}  Auto $${formatNumber(petAutoPerSecond())}/s`;
  el.ore.textContent = ore.name;
  el.nextOre.textContent = next ? next.name : "Max Ore";
  el.map.textContent = map.name;
  el.mapBoost.textContent = `${formatNumber(map.boost)}x`;
  el.goal.textContent = next ? `Reach ${formatNumber(next.unlock)} mined progress to unlock ${next.name}.` : "Prepare for your next Rebirth!";
  el.upgradeCost.textContent = `Cost: $${formatNumber(upgradeCost())}`;
  el.petCost.textContent = petStatus.text;
  el.rebirthCost.textContent = `Need: $${formatNumber(rebirthCost())}`;
  el.mapStatus.textContent = canSwitchMap ? map.name : lockedMap ? `Unlock at ${lockedMap.rebirths}` : "All unlocked";
  el.autoStatus.textContent = state.autoClickerOwned ? "ON" : autoUnlocked ? "Buy: $1M" : "Locked";

  setLocked(btn.upgrade, !canUpgrade);
  setLocked(btn.pet, petStatus.locked);
  setLocked(btn.rebirth, !canRebirth);
  setLocked(btn.map, !canSwitchMap);
  setLocked(btn.auto, !canAuto);
  updateAudioButton();
}

function setLocked(button, locked) {
  button.classList.toggle("locked", locked);
}

function addMineParticles(x, y, count, ore) {
  for (let i = 0; i < count; i++) {
    const color = oreParticleColor(ore);
    mineParticles.push({
      x: x + (Math.random() - 0.5) * 38,
      y: y + (Math.random() - 0.5) * 34,
      vx: -115 + Math.random() * 230,
      vy: -130 - Math.random() * 90,
      life: 0.42 + Math.random() * 0.28,
      size: 3 + Math.random() * 5,
      color,
    });
  }
}

function addFrontParticles(x, y, count, ore) {
  if (!particleLayer) return;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    const duration = 360 + Math.random() * 320;
    particle.className = "pixel-particle";
    particle.style.setProperty("--px", x + (Math.random() - 0.5) * 34);
    particle.style.setProperty("--py", y + (Math.random() - 0.5) * 22);
    particle.style.setProperty("--dx", -70 + Math.random() * 140);
    particle.style.setProperty("--dy", -80 - Math.random() * 70);
    particle.style.setProperty("--size", 4 + Math.random() * 4);
    particle.style.setProperty("--color", oreParticleColor(ore));
    particle.style.setProperty("--duration", `${duration}ms`);
    particleLayer.appendChild(particle);
    window.setTimeout(() => particle.remove(), duration + 80);
  }
}

function oreParticleColor(ore) {
  if (ore.name === "Copper") return Math.random() > 0.45 ? "#c06a31" : "#79442c";
  if (ore.name === "Iron") return Math.random() > 0.45 ? "#8b9296" : "#555b60";
  if (ore.name === "Silver") return Math.random() > 0.45 ? "#cbd4d8" : "#808a90";
  if (ore.name === "Gold") return Math.random() > 0.45 ? "#f5c33a" : "#9b6f24";
  return Math.random() > 0.45 ? "#777982" : "#4e5058";
}

function eventToGamePoint(event) {
  const rectBox = canvas.getBoundingClientRect();
  const shellBox = gameShell.getBoundingClientRect();
  return {
    x: ((event.clientX - rectBox.left) / rectBox.width) * 960,
    y: ((event.clientY - rectBox.top) / rectBox.height) * 640,
    layerX: event.clientX - shellBox.left,
    layerY: event.clientY - shellBox.top,
  };
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;
}

function updateGameScale() {
  const viewportW = window.visualViewport?.width || window.innerWidth;
  const viewportH = window.visualViewport?.height || window.innerHeight;
  const landscapeFit = window.matchMedia("(pointer: coarse)").matches && viewportW > viewportH && viewportH <= 640;

  document.documentElement.classList.toggle("landscape-fit", landscapeFit);
  if (!landscapeFit) {
    gameShell.style.removeProperty("--game-scale");
    gameShell.style.removeProperty("--game-left");
    gameShell.style.removeProperty("--game-top");
    return;
  }

  const scale = Math.min(viewportW / GAME_WIDTH, viewportH / GAME_HEIGHT);
  const left = (viewportW - GAME_WIDTH * scale) / 2;
  const top = (viewportH - GAME_HEIGHT * scale) / 2;
  gameShell.style.setProperty("--game-scale", scale);
  gameShell.style.setProperty("--game-left", `${left}px`);
  gameShell.style.setProperty("--game-top", `${top}px`);
}

function pointHitsOre(point) {
  return point.x >= 545 && point.x <= 665 && point.y >= 310 && point.y <= 425;
}

function tick(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  const gameTime = now / 1000;
  state.coins += petAutoPerSecond() * dt;

  if (ownsPet("crab")) {
    crabTimer += dt;
    if (crabTimer >= CRAB_FIND_INTERVAL) {
      crabTimer -= CRAB_FIND_INTERVAL;
      const crabGain = perMine() * (1 + Math.random() * 2);
      state.coins += crabGain;
      setMessage(`Crab found coins! +$${formatNumber(crabGain)}`, 1.8);
      addFloat(`Crab +$${formatNumber(crabGain)}`, 328, 362, "#ff9b4c");
      playPetSound();
    }
  } else {
    crabTimer = 0;
  }

  if (state.autoClickerOwned) {
    autoTimer += dt;
    while (autoTimer >= AUTO_CLICKER_INTERVAL) {
      autoTimer -= AUTO_CLICKER_INTERVAL;
      mine(true);
    }
  }

  minePulse = Math.max(0, minePulse - dt);
  messageTimer = Math.max(0, messageTimer - dt);
  if (messageTimer === 0 && gameTime - lastActionTime >= IDLE_DELAY) {
    el.message.textContent = "Lucas is relaxing...";
  } else if (messageTimer === 0 && el.message.textContent !== message) {
    el.message.textContent = message;
  }

  for (const item of floatTexts) {
    item.y -= 42 * dt;
    item.life -= dt;
  }
  floatTexts = floatTexts.filter((item) => item.life > 0);

  for (const particle of mineParticles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 280 * dt;
    particle.life -= dt;
  }
  mineParticles = mineParticles.filter((particle) => particle.life > 0);

  drawScene(now / 1000);
  updateUI();
  requestAnimationFrame(tick);
}

function drawScene(time) {
  ctx.save();
  drawBackground(currentMap().name, time);
  drawOre(565, 330, currentOre(), minePulse);
  const resting = time - lastActionTime >= IDLE_DELAY && minePulse <= 0;
  drawLucas(408, 230 + Math.sin(time * 2.2) * 2, minePulse > 0, time, resting);
  drawPets(time);
  drawMineParticles();
  drawFloatTexts();
  ctx.restore();
}

function drawBackground(mapName, time) {
  if (mapName === "Volcano Cave") return drawVolcanoCave(time);
  if (mapName === "Crystal Ocean") return drawCrystalOcean(time);
  if (mapName === "Sky Island") return drawSkyIsland(time);
  drawBeachIsland(time);
}

function drawBeachIsland(time) {
  for (let y = 0; y < 276; y += 4) {
    const blend = y / 276;
    ctx.fillStyle = rgb(145 * (1 - blend) + 62 * blend, 214 * (1 - blend) + 182 * blend, 236 * (1 - blend) + 222 * blend);
    ctx.fillRect(0, y, 960, 4);
  }
  drawCloud(95 + Math.sin(time * 0.5) * 6, 58, true);
  drawCloud(545 + Math.cos(time * 0.45) * 7, 48, true);
  drawCloud(715, 145, true);

  rect("#67a97b", 0, 258, 210, 26);
  poly("#967369", [[38, 260], [116, 162], [202, 260]]);
  poly("#765b57", [[78, 260], [116, 162], [146, 260]]);
  rect("#f1823a", 106, 174, 22, 12);
  rect("#ffe170", 112, 178, 10, 8);
  rect("#ffe85f", 800, 45, 72, 72);
  rect("#fff496", 816, 61, 40, 40);

  rect("#318dbd", 0, 275, 960, 78);
  rect("#1f78aa", 0, 318, 960, 35);
  drawFarIsland(650, 252, 160);
  drawFarIsland(260, 260, 120);
  for (let x = 18; x < 960; x += 72) {
    rect("#8ae0ee", x + (time * 10) % 20, 304, 32, 4);
    rect("#1d6f9a", x + 34, 328, 24, 3);
  }

  rect("#eed184", 0, 350, 960, 76);
  for (let x = 12; x < 960; x += 58) rect("#ddbe70", x, 392, 18, 6);
  drawPalm(24, 284, 0.9);
  drawPalm(125, 248, 1);
  drawPalm(246, 310, 0.8);
  drawPalm(886, 262, 0.85);

  rect("#2c2228", 0, 420, 960, 220);
  rect("#4c3d44", 0, 420, 960, 34);
  for (let x = 0; x < 960; x += 64) rect("#745c53", x, 430 + ((x / 64) % 3) * 18, 42, 28);
  for (let x = 32; x < 960; x += 96) rect("#3a2f36", x, 545, 56, 34);
  drawForegroundPlants();
  rect("#2d2320", 324, 402, 342, 30);
  rect("#60483a", 330, 408, 330, 18);
  rect("#916f4b", 360, 390, 270, 22);
}

function drawVolcanoCave(time) {
  rect("#6a4046", 0, 0, 960, 640);
  rect("#97533e", 0, 0, 960, 275);
  poly("#57363c", [[0, 285], [155, 92], [310, 285]]);
  poly("#5f3937", [[650, 285], [790, 110], [960, 285]]);
  rect("#ff9e49", 0, 284, 960, 30);
  for (let x = 20; x < 960; x += 80) rect("#ffd662", x + Math.sin(time * 4) * 3, 294, 38, 6);
  rect("#a86b48", 0, 350, 960, 76);
  rect("#483238", 0, 420, 960, 220);
  for (let x = 0; x < 960; x += 64) rect("#804b3e", x, 440 + ((x / 64) % 3) * 18, 42, 28);
  rect("#de6936", 330, 408, 330, 18);
  rect("#ffbc52", 360, 390, 270, 22);
  drawMapLabel("Volcano Cave");
}

function drawCrystalOcean(time) {
  rect("#30a8cd", 0, 0, 960, 640);
  rect("#247cb2", 0, 230, 960, 150);
  for (let x = 10; x < 960; x += 70) {
    rect("#71dcee", x + Math.sin(time + x) * 5, 270, 34, 5);
    rect("#1f629a", x + 22, 320, 24, 4);
  }
  rect("#c6e4d0", 0, 350, 960, 76);
  for (let x = 55; x < 960; x += 120) drawCrystal(x, 365, "#4ae1eb");
  rect("#243a5c", 0, 420, 960, 220);
  for (let x = 0; x < 960; x += 76) rect("#375e82", x, 438 + ((x / 76) % 3) * 20, 50, 26);
  rect("#54c6de", 330, 408, 330, 18);
  rect("#9beff5", 360, 390, 270, 22);
  drawMapLabel("Crystal Ocean");
}

function drawSkyIsland(time) {
  rect("#9ee2fa", 0, 0, 960, 640);
  drawCloud(80 + Math.sin(time) * 10, 80);
  drawCloud(290, 150);
  drawCloud(670 + Math.cos(time) * 10, 88);
  drawRainbow(420, 6);
  rect("#5db26e", 110, 292, 190, 26);
  rect("#81603f", 130, 318, 150, 38);
  rect("#e7d380", 0, 350, 960, 76);
  rect("#46425c", 0, 420, 960, 220);
  for (let x = 0; x < 960; x += 86) rect("#606284", x, 440 + ((x / 86) % 3) * 20, 52, 26);
  rect("#9ee2fa", 330, 408, 330, 18);
  rect("#ffffff", 360, 390, 270, 22);
  drawMapLabel("Sky Island");
}

function drawLucas(baseX, baseY, mining, time, resting = false) {
  const x = baseX + (mining ? 7 + Math.sin(minePulse * 24) * 3 : 0);
  const y = baseY + (mining ? 3 : resting ? 24 : 0);
  const blink = resting || Math.floor(time * 2.2) % 9 === 0;
  const equipment = getLucasEquipmentStage();
  const skin = "#ecb27c";
  const skinShadow = "#cd8a5f";
  const outline = "#2d2320";
  if (equipment.aura) {
    ctx.globalAlpha = 0.75 + Math.sin(time * 3) * 0.15;
    rect(equipment.aura, x - 8, y - 8, 142, 262);
    ctx.globalAlpha = 1;
  }
  rect("rgba(0,0,0,0.28)", x + 6, y + 236, 122, 12);
  rect(outline, x + 74, y + 102, 40, 64);
  rect(equipment.backpack, x + 76, y + 104, 34, 58);
  rect(equipment.backpackTrim, x + 82, y + 112, 20, 10);
  if (equipment.name !== "Beginner") rect(equipment.backpackTrim, x + 92, y + 140, 8, 8);

  rect(skinShadow, x + 47, y + 86, 24, 20);
  rect(skin, x + 49, y + 84, 22, 22);
  rect(outline, x + 20, y + 91, 78, 81);
  rect(equipment.shirtDark, x + 24, y + 93, 70, 13);
  rect(equipment.shirt, x + 22, y + 102, 74, 66);
  rect(equipment.shirtLight, x + 32, y + 109, 16, 47);
  rect("#ffffff", x + 49, y + 110, 18, 10);
  if (equipment.name === "Legend Miner") rect("#d5fbff", x + 70, y + 112, 14, 42);
  rect(equipment.belt, x + 22, y + 160, 74, 9);
  rect("#5c4636", x + 54, y + 158, 14, 13);
  if (resting) {
    rect(equipment.pants, x + 18, y + 166, 40, 24);
    rect(equipment.pants, x + 66, y + 166, 40, 24);
    rect(equipment.boots, x + 7, y + 188, 48, 16);
    rect(equipment.boots, x + 78, y + 188, 48, 16);
    if (equipment.name !== "Beginner") {
      rect(equipment.bootTrim, x + 16, y + 188, 18, 5);
      rect(equipment.bootTrim, x + 88, y + 188, 18, 5);
    }
  } else {
    rect(equipment.pants, x + 26, y + 166, 28, 48);
    rect(equipment.pants, x + 64, y + 166, 28, 48);
    rect(skin, x + 30, y + 204, 22, 24);
    rect(skin, x + 68, y + 204, 22, 24);
    rect(equipment.boots, x + 18, y + 224, 40, 15);
    rect(equipment.boots, x + 60, y + 224, 40, 15);
    if (equipment.name !== "Beginner") {
      rect(equipment.bootTrim, x + 20, y + 224, 30, 5);
      rect(equipment.bootTrim, x + 62, y + 224, 30, 5);
    }
  }
  rect(skin, x + 4, y + 110, 22, 54);
  rect(equipment.glove, x, y + 156, 28, 20);

  drawLucasHead(x, y, blink);
  drawPickaxe(x, y, mining, resting, equipment, time);
  drawText("Lucas", x + 24, y - 44, 20, "#fafaf5", "#2d5f82");
}

function drawLucasHead(x, y, blink) {
  const outline = "#2d2320";
  rect(outline, x + 10, y + 6, 92, 86);
  rect("#cd8a5f", x + 11, y + 7, 90, 84);
  rect("#ecb27c", x + 12, y + 8, 88, 82);
  rect("#ffcd9b", x + 28, y + 25, 24, 8);
  rect("#231b16", x + 6, y, 100, 24);
  rect("#231b16", x + 4, y + 18, 20, 46);
  rect("#231b16", x + 88, y + 18, 20, 38);
  rect("#4b3222", x + 28, y - 8, 42, 16);
  const eyeH = blink ? 4 : 17;
  const eyeY = blink ? y + 48 : y + 40;
  for (const eyeX of [x + 34, x + 66]) {
    rect(outline, eyeX - 2, eyeY - 2, 21, eyeH + 6);
    rect("#ffffff", eyeX, eyeY, 16, eyeH);
    rect("#1c1c22", eyeX + 6, eyeY + 3, 6, Math.max(3, eyeH - 8));
    if (!blink) rect("#ffffff", eyeX + 10, eyeY + 4, 3, 3);
  }
  rect(outline, x + 49, y + 67, 20, 7);
  rect("#c44a46", x + 51, y + 68, 16, 4);
}

function drawPickaxe(x, y, mining, resting = false, equipment = LUCAS_STAGES[0], time = 0) {
  if (resting) {
    line("#2d2320", x + 120, y + 178, x + 178, y + 194, 9);
    line(equipment.pickHandle, x + 120, y + 178, x + 178, y + 194, 7);
    rect("#2d2320", x + 166, y + 184, 56, 15);
    rect(equipment.pickHead, x + 168, y + 186, 52, 11);
    rect(equipment.pickHighlight, x + 176, y + 187, 18, 4);
    return;
  }
  const swing = mining ? Math.sin((0.25 - minePulse) / 0.25 * Math.PI) : 0;
  const hand = mining ? [x + 116 + 42 * swing, y + 116 + 28 * swing] : [x + 112, y + 122];
  const end = mining ? [hand[0] + 78, hand[1] - 96 + 112 * swing] : [x + 166, y + 58];
  line("#ecb27c", x + 88, y + 120, hand[0], hand[1], 16);
  rect(equipment.glove, hand[0] - 9, hand[1] - 7, 22, 18);
  line("#2d2320", hand[0], hand[1], end[0], end[1], 9);
  line(equipment.pickHandle, hand[0], hand[1], end[0], end[1], 7);
  if (equipment.name === "Legend Miner") {
    ctx.globalAlpha = 0.35 + Math.sin(time * 6) * 0.1;
    line(equipment.pickHighlight, hand[0], hand[1], end[0], end[1], 14);
    ctx.globalAlpha = 1;
  }
  rect("#2d2320", end[0] - 28, end[1] - 15, 60, 16);
  rect(equipment.pickHead, end[0] - 26, end[1] - 13, 56, 12);
  rect(equipment.pickHighlight, end[0] - 8, end[1] - 20, 18, 7);
  if (equipment.name === "Legend Miner") rect("#ffffff", end[0] + 12, end[1] - 10, 12, 4);
  if (mining) line("rgba(255,255,255,0.45)", hand[0] - 10, hand[1] - 12, end[0] + 24, end[1], 10);
}

function drawPets(time) {
  const positions = [[345, 382], [305, 408], [370, 420]];
  normalizePets();
  for (let i = 0; i < Math.min(3, state.ownedPets.length); i++) {
    const [x0, y0] = positions[i];
    const x = x0 + Math.sin(time * 1.8 + i) * 2;
    const y = y0 + Math.sin(time * 2.4 + i) * 4;
    const petKey = state.ownedPets[i];
    if (petKey === "crab") drawCrabPet(x, y, time);
    else if (petKey === "dragon") drawDragonPet(x, y, time);
    else drawTurtlePet(x, y, time);
  }
}

function drawTurtlePet(x, y, time) {
  const blink = Math.floor(time * 1.5) % 8 === 0;
  rect("#276647", x + 8, y + 12, 48, 30);
  rect("#429c5f", x + 12, y + 6, 40, 34);
  rect("#5cb868", x + 22, y + 10, 18, 10);
  rect("#69c67a", x + 52, y + 16, 18, 16);
  rect("#1c1c22", x + 62, y + 20, 5, blink ? 2 : 4);
  rect("#3a8a58", x + 8, y + 38, 12, 8);
  rect("#3a8a58", x + 42, y + 38, 12, 8);
}

function drawCrabPet(x, y, time) {
  const clawWave = Math.floor(time * 2) % 5 === 0 ? -5 : 0;
  rect("#7d2b20", x + 12, y + 20, 54, 28);
  rect("#f26f3e", x + 16, y + 16, 46, 30);
  rect("#ff9b4c", x + 26, y + 20, 18, 8);
  rect("#ffffff", x + 24, y + 4, 10, 16);
  rect("#ffffff", x + 44, y + 4, 10, 16);
  rect("#1c1c22", x + 27, y + 8, 5, 6);
  rect("#1c1c22", x + 47, y + 8, 5, 6);
  rect("#f26f3e", x - 4, y + 14 + clawWave, 18, 16);
  rect("#f26f3e", x + 64, y + 14 - clawWave, 18, 16);
  rect("#7d2b20", x + 8, y + 46, 10, 8);
  rect("#7d2b20", x + 28, y + 48, 10, 8);
  rect("#7d2b20", x + 52, y + 46, 10, 8);
}

function drawDragonPet(x, y, time) {
  const glow = ownsPet("dragon") && minePulse > 0 ? 0.4 : 0.15;
  ctx.globalAlpha = glow;
  rect("#ff8c3a", x + 8, y + 2, 64, 48);
  ctx.globalAlpha = 1;
  rect("#812b24", x + 14, y + 18, 48, 32);
  rect("#d94d2f", x + 18, y + 12, 42, 34);
  rect("#ffb452", x + 30, y + 22, 16, 10);
  rect("#ffcc55", x + 48, y + 6, 14, 12);
  rect("#ffffff", x + 48, y + 20, 12, 10);
  rect("#1c1c22", x + 54, y + 23, 4, 5);
  rect("#ffc147", x + 4, y + 24, 16, 8);
  rect("#ffc147", x + 26, y + 2, 8, 12);
  rect("#ffc147", x + 42, y + 2, 8, 12);
  if (minePulse > 0) {
    rect("#ff7a24", x + 66, y + 20, 18, 8);
    rect("#ffd66b", x + 76, y + 22, 12, 5);
  }
}

function drawOre(x, y, ore, pulse) {
  const shake = pulse > 0 ? Math.sin(pulse * 80) * 5 : 0;
  rect(ore.dark, x - 6 + shake, y - 5, 98, 82);
  rect(ore.color, x + shake, y, 86, 72);
  rect(lighten(ore.color), x + 12 + shake, y + 10, 30, 18);
  rect(ore.dark, x + 48 + shake, y + 42, 24, 16);
  rect("#f5be37", x + 28 + shake, y + 35, 14, 14);
  rect("#50dcd2", x + 54 + shake, y + 16, 12, 12);
  drawText(ore.name, x + 20 + shake, y + 90, 15, "#fafaf5", "#2d3236");
}

function drawMineParticles() {
  for (const particle of mineParticles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, particle.life * 2.2));
    rect(particle.color, particle.x, particle.y, particle.size, particle.size);
    ctx.globalAlpha = 1;
  }
}

function drawFloatTexts() {
  for (const item of floatTexts) {
    ctx.globalAlpha = Math.max(0, item.life);
    drawText(item.text, item.x, item.y, 22, item.color, "#2d302f");
    ctx.globalAlpha = 1;
  }
}

function drawCloud(x, y, fade = false) {
  rect(fade ? "#eefafa" : "#fafaf5", x, y + 14, 86, 22);
  rect(fade ? "#eefafa" : "#fafaf5", x + 18, y, 34, 26);
  rect(fade ? "#eefafa" : "#fafaf5", x + 48, y + 6, 30, 26);
  rect(fade ? "#d2ebee" : "#def4f6", x + 8, y + 32, 68, 5);
}

function drawPalm(x, y, scale = 1) {
  const tw = 18 * scale, th = 86 * scale, lw = 56 * scale, lh = 18 * scale;
  rect("#80502e", x, y, tw, th);
  rect("#9a6434", x + tw / 3, y + 8, tw / 3, th - 16);
  const ly = y - 16 * scale;
  rect("#2a964b", x - 36 * scale, ly, lw, lh);
  rect("#2a964b", x + 8 * scale, ly - 14 * scale, lw, lh);
  rect("#2a964b", x - 14 * scale, ly - 30 * scale, lw, lh);
  rect("#603d22", x + 2 * scale, y - 2 * scale, 10 * scale, 10 * scale);
  rect("#603d22", x + 16 * scale, y - 4 * scale, 10 * scale, 10 * scale);
}

function drawFarIsland(x, y, w) {
  rect("#4aa068", x, y, w, 16);
  rect("#ddc676", x - 12, y + 14, w + 24, 10);
  for (let tx = x + 16; tx < x + w - 16; tx += 34) {
    rect("#68482a", tx, y - 20, 8, 28);
    rect("#369b52", tx - 12, y - 28, 28, 10);
    rect("#48b25c", tx - 3, y - 38, 28, 10);
  }
}

function drawForegroundPlants() {
  for (let x = 0; x < 960; x += 38) {
    const h = 18 + ((x / 38) % 4) * 5;
    rect("#265c34", x, 640 - h, 28, h);
    rect("#36803e", x + 8, 640 - h - 8, 18, 10);
  }
  [[54, 586, "#ec4e87"], [112, 596, "#ff7452"], [870, 590, "#5daef0"], [912, 604, "#ec4e87"]].forEach(([x, y, c]) => {
    rect(c, x, y, 10, 10);
    rect(c, x + 12, y, 10, 10);
    rect(c, x + 6, y - 8, 10, 10);
    rect("#f5be37", x + 8, y + 2, 6, 6);
  });
}

function drawCrystal(x, y, color) {
  poly(color, [[x, y + 34], [x + 16, y], [x + 32, y + 34]]);
  rect("#ffffff", x + 15, y + 12, 5, 12);
}

function drawRainbow(x, y) {
  const colors = ["rgba(255,118,118,0.45)", "rgba(255,195,92,0.45)", "rgba(255,235,115,0.45)", "rgba(120,220,130,0.45)", "rgba(110,190,255,0.45)"];
  for (let i = 0; i < colors.length; i++) {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x + 140, y + 165, 140 + i * 5, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
}

function drawMapLabel(text) {
  drawText(text, 354, 266, 17, "#fafaf5", "#2f5b77");
}

function drawText(text, x, y, size, fill, stroke) {
  ctx.font = `900 ${size}px Arial`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function rect(color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function line(color, x1, y1, x2, y2, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(color, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}

function rgb(r, g, b) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function lighten(color) {
  const table = {
    "#777982": "#9696a0",
    "#c06a31": "#ef974c",
    "#8b9296": "#afb8ba",
    "#cbd4d8": "#ebf2f5",
    "#f5c33a": "#ffea76",
    "#63e1ef": "#c6faff",
    "#38d47a": "#91f5ac",
    "#dc3e52": "#ff848e",
  };
  return table[color] || "#fff8c8";
}

btn.mine.addEventListener("click", (event) => mine(false, eventToGamePoint(event)));
canvas.addEventListener("click", (event) => {
  const point = eventToGamePoint(event);
  if (pointHitsOre(point)) mine(false, point);
});
btn.upgrade.addEventListener("click", buyUpgrade);
btn.pet.addEventListener("click", buyPet);
btn.rebirth.addEventListener("click", rebirth);
btn.map.addEventListener("click", switchMap);
btn.auto.addEventListener("click", buyAutoClicker);
btn.save.addEventListener("click", saveGame);
btn.newGame.addEventListener("click", newGame);
btn.audio.addEventListener("click", () => {
  audioOn = !audioOn;
  localStorage.setItem(AUDIO_KEY, audioOn ? "on" : "off");
  if (audioOn) {
    handleUserAudio();
    playUpgradeSound();
  } else {
    stopMusic();
  }
  updateAudioButton();
});

window.addEventListener("resize", updateGameScale);
window.addEventListener("orientationchange", () => window.setTimeout(updateGameScale, 120));
window.visualViewport?.addEventListener("resize", updateGameScale);

loadGame();
updateGameScale();
updateAudioButton();
updateUI();
requestAnimationFrame(tick);

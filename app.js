const STORAGE_KEY = "experiment-barbarian-sheet-v1";
const BACKUP_STORAGE_KEY = `${STORAGE_KEY}-backups`;
const MAX_BACKUPS = 12;
const AUTO_BACKUP_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_CHARACTER_TITLE = "Experiment Barbarian";
const ABILITY_LABELS = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

const SKILL_DEFINITIONS = [
  { name: "Athletics", ability: "STR" },
  { name: "Acrobatics", ability: "DEX" },
  { name: "Sleight of Hand", ability: "DEX" },
  { name: "Stealth", ability: "DEX" },
  { name: "Arcana", ability: "INT" },
  { name: "History", ability: "INT" },
  { name: "Investigation", ability: "INT" },
  { name: "Nature", ability: "INT" },
  { name: "Religion", ability: "INT" },
  { name: "Animal Handling", ability: "WIS" },
  { name: "Insight", ability: "WIS" },
  { name: "Medicine", ability: "WIS" },
  { name: "Perception", ability: "WIS" },
  { name: "Survival", ability: "WIS" },
  { name: "Deception", ability: "CHA" },
  { name: "Intimidation", ability: "CHA" },
  { name: "Performance", ability: "CHA" },
  { name: "Persuasion", ability: "CHA" },
];

const EXPERIMENT_RAGES = [
  {
    key: "ferocity",
    name: "Ferocity",
    summary: "Energized frenzy, ignore Difficult Terrain, and pair Cleave with another mastery.",
    details:
      "This serum throws you into an energized frenzy. You ignore Difficult Terrain, and when you hit with a Melee weapon or Unarmed Strike, you can activate the Cleave mastery property in addition to a different mastery property you're using.",
  },
  {
    key: "monstrosity",
    name: "Monstrosity",
    summary: "Monstrous size, +5 ft. reach, and a Strength miss can become a hit.",
    details:
      "The serum expands your body to monstrous proportions and can change your appearance in cosmetic ways, such as by altering facial features, skin tone, and hair length or color. Your reach increases by 5 feet, and once per turn when you miss with an attack roll that relies on Strength, you can add your Rage Damage bonus to the total, potentially causing the attack to hit. If you are smaller than Large, you become Large, along with anything you are wearing or carrying. If there isn't enough room to accommodate the size change, your size doesn't change.",
  },
  {
    key: "reconstruction",
    name: "Reconstruction",
    summary: "Spend Hit Points Dice to heal; excess becomes Temporary Hit Points.",
    details:
      "The serum dulls pain and forces wounds to rapidly knit. Upon activation and at the start of each of your turns, you can expend and roll a Hit Points Die. You regain a number of Hit Points equal to the number rolled plus your Constitution modifier (minimum of 1 Hit Point). You gain any excess beyond your Hit Point maximum as Temporary Hit Points.\n\nIf you take Acid or Fire damage, this serum doesn't function at the start of your next turn.",
  },
];

const defaultState = {
  ui: {
    collapsedSkillGroups: {},
    reckless: false,
  },
  character: {
    name: "",
    level: 5,
    speed: 40,
    proficiencyBonus: 3,
    hp: 0,
    tempHp: 0,
    totalHp: 0,
    armorClass: 10,
    armorClassNotes: "",
    heroicInspiration: false,
    hitDiceUsed: 0,
    hitDiceTotal: 1,
    hitDiceType: "d12",
    hitDiceSecondaryUsed: 0,
    hitDiceSecondaryTotal: 1,
    hitDiceSecondaryType: "N/A",
  },
  money: {
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  },
  rage: {
    total: 2,
    used: 0,
    inRage: false,
    choosingType: false,
    activeType: "",
    serumExpanded: {},
  },
  fighter: {
    secondWindTotal: 2,
    secondWindUsed: 0,
    actionSurgeTotal: 0,
    actionSurgeUsed: 0,
  },
  stats: [
    { name: "STR", value: 10, saveProficient: false, saveModifier: 0 },
    { name: "DEX", value: 10, saveProficient: false, saveModifier: 0 },
    { name: "CON", value: 10, saveProficient: false, saveModifier: 0 },
    { name: "INT", value: 10, saveProficient: false, saveModifier: 0 },
    { name: "WIS", value: 10, saveProficient: false, saveModifier: 0 },
    { name: "CHA", value: 10, saveProficient: false, saveModifier: 0 },
  ],
  skills: SKILL_DEFINITIONS.map((skill) => ({ ...skill, proficient: false, modifier: 0 })),
  actions: [
    {
      name: "Greataxe",
      description: "Heavy swing. Add rage damage while raging.",
      toHit: "+0",
      damage: "1d12 + STR",
      chargesTotal: 0,
      chargesUsed: 0,
    },
    {
      name: "Unarmed Strike",
      description: "A desperate stitched-knuckle blow.",
      toHit: "+0",
      damage: "1 + STR",
      chargesTotal: 0,
      chargesUsed: 0,
    },
  ],
  abilities: [
    {
      name: "Rage",
      description: "Bonus action. Gain resistance and rage damage while raging.",
      chargesTotal: 0,
      chargesUsed: 0,
    },
  ],
  inventory: [
    { name: "Explorer's Pack", quantity: 1, notes: "", chargesTotal: 0, chargesUsed: 0 },
    { name: "Potion of Healing", quantity: 1, notes: "Healing: 2d4 + 2", chargesTotal: 0, chargesUsed: 0 },
  ],
  statuses: [
    "Blinded",
    "Charmed",
    "Deafened",
    "Exhaustion",
    "Frightened",
    "Grappled",
    "Incapacitated",
    "Invisible",
    "Paralyzed",
    "Petrified",
    "Poisoned",
    "Prone",
    "Restrained",
    "Stunned",
    "Unconscious",
  ].map((name) => ({ name, active: false, duration: "", notes: "" })),
  notes: {
    sessionScratchPad: "",
    locations: [],
    people: [],
    plot: [],
    backstory: [],
    sessions: [],
  },
};

let state = loadState();
let activeNoteTab = "locations";
let activeView = "sheet";
let activeCharacterTab = "character";
let showInactiveStatuses = false;
let noteSearchQuery = "";
let activeNoteFilter = null;
let inventorySearchQuery = "";
let activeInventoryFilter = null;
let showHiddenInventory = false;
let showHiddenNotes = false;
let globalSearchQuery = "";
let pendingUndoAction = null;
let featureFlashTimer = null;
let lastAutoBackupAt = 0;
let lastBackupSignature = JSON.stringify(state);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDefaults(saved, defaults) {
  if (Array.isArray(defaults)) {
    return Array.isArray(saved) ? saved : clone(defaults);
  }

  if (defaults && typeof defaults === "object") {
    const merged = {};
    for (const key of Object.keys(defaults)) {
      merged[key] = mergeDefaults(saved?.[key], defaults[key]);
    }
    for (const key of Object.keys(saved || {})) {
      if (!(key in merged)) merged[key] = saved[key];
    }
    return merged;
  }

  return saved ?? defaults;
}

function formatCompactTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${String(date.getFullYear()).slice(-2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function formatBackupTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

function formatBackupReason(reason) {
  return {
    autosave: "Autosave",
    export: "Export",
    import: "Import",
    reset: "Reset",
    restore: "Restore",
    "pre-import": "Before Import",
    "pre-reset": "Before Reset",
    "pre-restore": "Before Restore",
  }[reason] || "Backup";
}

function loadBackups() {
  try {
    const backups = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY) || "[]");
    return Array.isArray(backups) ? backups : [];
  } catch {
    return [];
  }
}

function saveBackups(backups) {
  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups.slice(0, MAX_BACKUPS)));
  syncBackupButton();
}

function storeVersionedBackup(reason, snapshot = state) {
  const snapshotObject = typeof snapshot === "string" ? JSON.parse(snapshot) : clone(snapshot);
  const backupState = normalizeState(mergeDefaults(snapshotObject, defaultState));
  const serialized = JSON.stringify(backupState);
  const backups = loadBackups();
  backups.unshift({
    reason,
    timestamp: new Date().toISOString(),
    state: backupState,
  });
  saveBackups(backups);
  lastAutoBackupAt = Date.now();
  lastBackupSignature = serialized;
}

function maybeCreateVersionedBackup(serializedState) {
  const now = Date.now();
  if (serializedState === lastBackupSignature) return;
  if (now - lastAutoBackupAt < AUTO_BACKUP_INTERVAL_MS) return;
  storeVersionedBackup("autosave", serializedState);
}

function syncBackupButton() {
  const button = $("#restoreBackup");
  if (!button) return;
  const backupCount = loadBackups().length;
  button.disabled = backupCount === 0;
  button.textContent = backupCount ? `Restore Backup (${backupCount})` : "Restore Backup";
}

function syncUndoButton() {
  const button = $("#undoDelete");
  if (!button) return;
  button.hidden = !pendingUndoAction;
  button.textContent = pendingUndoAction ? `Undo ${pendingUndoAction.label}` : "Undo Delete";
}

function queueUndoAction(action) {
  pendingUndoAction = action;
  syncUndoButton();
}

function clearSearchInputs() {
  globalSearchQuery = "";
  const globalSearchInput = $("#globalSearchInput");
  if (globalSearchInput) globalSearchInput.value = "";
  closeGlobalSearch();
  const noteSearchInput = $("#noteSearchInput");
  if (noteSearchInput) noteSearchInput.value = "";
  const inventorySearchInput = $("#inventorySearchInput");
  if (inventorySearchInput) inventorySearchInput.value = "";
}

function applyLoadedState(nextState) {
  state = normalizeState(mergeDefaults(clone(nextState), defaultState));
  activeNoteFilter = null;
  noteSearchQuery = "";
  activeInventoryFilter = null;
  inventorySearchQuery = "";
  showHiddenInventory = false;
  showHiddenNotes = false;
  pendingUndoAction = null;
  saveState();
  syncPathInputs();
  clearSearchInputs();
  renderDynamicSections();
}

function undoLastDelete() {
  if (!pendingUndoAction) return;
  const action = pendingUndoAction;
  pendingUndoAction = null;
  action.restore();
  saveState();
  syncPathInputs();
  renderDynamicSections();
}

function restoreBackup() {
  const backups = loadBackups();
  if (!backups.length) {
    alert("No backups are available yet.");
    return;
  }
  const shownBackups = backups.slice(0, 8);
  const promptMessage = shownBackups
    .map((backup, index) => `${index + 1}. ${formatBackupReason(backup.reason)} - ${formatBackupTimestamp(backup.timestamp)}`)
    .join("\n");
  const answer = prompt(`Restore which backup?

${promptMessage}

Enter a number from 1 to ${shownBackups.length}.`);
  if (answer == null) return;
  const selectedIndex = Number(answer) - 1;
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= shownBackups.length) {
    alert("Please enter a valid backup number.");
    return;
  }
  const selectedBackup = shownBackups[selectedIndex];
  if (!confirm(`Restore ${formatBackupReason(selectedBackup.reason)} from ${formatBackupTimestamp(selectedBackup.timestamp)}?`)) return;
  storeVersionedBackup("pre-restore");
  applyLoadedState(selectedBackup.state);
  storeVersionedBackup("restore");
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(mergeDefaults(JSON.parse(raw), defaultState)) : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

function normalizeState(nextState) {
  const normalized = clone(nextState);
  normalized.character.armorClass = clampInteger(normalized.character.armorClass, 0, 99, 10);
  normalized.character.armorClassNotes = String(normalized.character.armorClassNotes || "");
  normalized.character.heroicInspiration = Boolean(normalized.character.heroicInspiration);
  normalized.money = {
    ...defaultState.money,
    ...(normalized.money || {}),
  };
  Object.keys(defaultState.money).forEach((denomination) => {
    normalized.money[denomination] = clampInteger(
      normalized.money[denomination],
      0,
      Number.MAX_SAFE_INTEGER,
      0,
    );
  });
  const hitDice = normalized.character?.hitDice;
  if (normalized.character.hitDiceRemaining == null && typeof hitDice === "string") {
    const match = hitDice.trim().match(/^(\d+)\s*(d\d+)$/i);
    if (match) {
      normalized.character.hitDiceRemaining = Number(match[1]);
      normalized.character.hitDiceType = match[2].toLowerCase();
    }
  }
  if (normalized.character.hitDiceType == null) normalized.character.hitDiceType = defaultState.character.hitDiceType;
  if (normalized.character.hitDiceSecondaryType == null) {
    normalized.character.hitDiceSecondaryType = defaultState.character.hitDiceSecondaryType;
  }
  [
    {
      usedKey: "hitDiceUsed",
      totalKey: "hitDiceTotal",
      remainingKey: "hitDiceRemaining",
      maxKey: "hitDiceMax",
      typeKey: "hitDiceType",
    },
    {
      usedKey: "hitDiceSecondaryUsed",
      totalKey: "hitDiceSecondaryTotal",
      remainingKey: "hitDiceSecondaryRemaining",
      maxKey: "hitDiceSecondaryMax",
      typeKey: "hitDiceSecondaryType",
    },
  ].forEach(({ usedKey, totalKey, remainingKey, maxKey, typeKey }) => {
    const hasLegacyValues = normalized.character[remainingKey] != null || normalized.character[maxKey] != null;
    if (hasLegacyValues) {
      const remaining = clampInteger(normalized.character[remainingKey], 0, 20, 0);
      const total = Math.max(remaining, clampInteger(normalized.character[maxKey], 1, 20, 1));
      normalized.character[totalKey] = total;
      normalized.character[usedKey] = normalized.character[typeKey] === "N/A" ? 0 : total - remaining;
    } else {
      const total = clampInteger(normalized.character[totalKey], 1, 20, 1);
      normalized.character[totalKey] = total;
      normalized.character[usedKey] = normalized.character[typeKey] === "N/A"
        ? 0
        : clampInteger(normalized.character[usedKey], 0, total, 0);
    }
    delete normalized.character[remainingKey];
    delete normalized.character[maxKey];
  });
  delete normalized.character.hitDice;
  normalized.ui = {
    ...defaultState.ui,
    ...(normalized.ui || {}),
    collapsedSkillGroups: {
      ...(normalized.ui?.collapsedSkillGroups || {}),
    },
  };
  const savedStats = Array.isArray(normalized.stats) ? normalized.stats : [];
  const savedStatsByName = new Map(savedStats.map((stat) => [stat.name?.trim().toUpperCase(), stat]));
  normalized.stats = defaultState.stats.map((stat) => ({
    ...stat,
    ...savedStatsByName.get(stat.name),
    name: stat.name,
    saveProficient: Boolean(savedStatsByName.get(stat.name)?.saveProficient),
    saveModifier: Number(savedStatsByName.get(stat.name)?.saveModifier || 0),
  }));
  normalized.rage = {
    ...defaultState.rage,
    ...(normalized.rage || {}),
    choosingType: Boolean(normalized.rage?.choosingType),
    activeType: normalized.rage?.activeType || "",
    serumExpanded: {
      ...(normalized.rage?.serumExpanded || {}),
    },
  };
  delete normalized.rage.types;
  normalized.fighter = {
    ...defaultState.fighter,
    ...(normalized.fighter || {}),
  };
  normalized.fighter.secondWindTotal = clampInteger(normalized.fighter.secondWindTotal, 0, 99, 2);
  normalized.fighter.secondWindUsed = clampInteger(
    normalized.fighter.secondWindUsed,
    0,
    normalized.fighter.secondWindTotal,
    0,
  );
  normalized.fighter.actionSurgeTotal = clampInteger(normalized.fighter.actionSurgeTotal, 0, 99, 0);
  normalized.fighter.actionSurgeUsed = clampInteger(
    normalized.fighter.actionSurgeUsed,
    0,
    normalized.fighter.actionSurgeTotal,
    0,
  );
  const normalizedStatuses = (normalized.statuses || []).map((status) => ({
    active: false,
    duration: "",
    notes: "",
    ...status,
  }));
  normalized.inventory = (normalized.inventory || []).map((item) => ({
    hidden: false,
    chargesTotal: 0,
    chargesUsed: 0,
    ...item,
  }));
  normalized.actions = (normalized.actions || []).map((action) => ({
    chargesTotal: 0,
    chargesUsed: 0,
    ...action,
  }));
  normalized.abilities = (normalized.abilities || []).map((ability) => ({
    chargesTotal: 0,
    chargesUsed: 0,
    ...ability,
  }));
  const savedSkills = Array.isArray(normalized.skills) ? normalized.skills : [];
  const savedSkillsByName = new Map(savedSkills.map((skill) => [skill.name?.trim().toLowerCase(), skill]));
  normalized.skills = SKILL_DEFINITIONS.map((skill) => ({
    proficient: false,
    modifier: 0,
    ...skill,
    ...savedSkillsByName.get(skill.name.trim().toLowerCase()),
    ability: skill.ability,
  }));
  Object.keys(normalized.notes || {}).forEach((key) => {
    if (Array.isArray(normalized.notes[key])) {
      normalized.notes[key] = normalized.notes[key].map((note) => ({
        hidden: key === "sessions" ? undefined : false,
        expanded: key === "sessions" ? note?.expanded !== false : note?.expanded,
        ...note,
      }));
    }
  });
  normalized.notes.sessions = (normalized.notes.sessions || []).map((note) => ({
    sessionNumber: 0,
    date: "",
    body: "",
    expanded: true,
    ...note,
    expanded: note?.expanded !== false,
  }));
  normalized.statuses = normalizedStatuses;
  if (Array.isArray(normalized.potions) && normalized.potions.length) {
    const existingInventory = new Set(
      normalized.inventory.map((item) => `${item.name || ""}|${item.quantity || ""}|${item.notes || ""}`),
    );
    normalized.potions.forEach((potion) => {
      const item = {
        name: potion.name || "Healing Potion",
        quantity: potion.quantity ?? 1,
        notes: potion.die ? `Healing: ${potion.die}` : "",
        expanded: false,
      };
      const key = `${item.name}|${item.quantity}|${item.notes}`;
      if (!existingInventory.has(key)) {
        normalized.inventory.push(item);
        existingInventory.add(key);
      }
    });
  }
  delete normalized.potions;
  return normalized;
}

function saveState() {
  clampCharacterHp();
  clampCharacterArmorClass();
  clampCharacterHitDice();
  clampMoney();
  clampFighterUses();
  const serializedState = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, serializedState);
  maybeCreateVersionedBackup(serializedState);
  updateComputedValues();
}

function getByPath(path) {
  return path.split(".").reduce((target, key) => target?.[key], state);
}

function setByPath(path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((current, key) => current[key], state);
  target[last] = value;
}

function clampInteger(value, min, max, fallback = min) {
  const number = Number(value);
  const normalized = Number.isFinite(number) ? Math.trunc(number) : fallback;
  return Math.max(min, Math.min(max, normalized));
}

function clampCharacterHp() {
  const currentHp = Number(state.character.hp || 0);
  const totalHp = Number(state.character.totalHp || 0);
  const maxHp = totalHp > 0 ? totalHp : Infinity;
  state.character.hp = Math.max(0, Math.min(currentHp, maxHp));
}

function clampCharacterArmorClass() {
  state.character.armorClass = clampInteger(state.character.armorClass, 0, 99, 10);
  state.character.armorClassNotes = String(state.character.armorClassNotes || "");
}

function syncArmorClassShield() {
  const shield = $("#acShieldButton");
  const value = $("#acShieldValue");
  if (!shield || !value) return;
  value.textContent = String(state.character.armorClass);
  shield.setAttribute("aria-label", `Armor Class ${state.character.armorClass}. Edit Armor Class`);
}

function syncHeroicInspirationButton() {
  const button = $("#heroicInspirationButton");
  if (!button) return;
  const isActive = Boolean(state.character.heroicInspiration);
  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
  button.setAttribute(
    "aria-label",
    `${isActive ? "Heroic Inspiration available" : "Heroic Inspiration not available"}. Toggle Heroic Inspiration`,
  );
}

function clampCharacterHitDice() {
  [
    ["hitDiceUsed", "hitDiceTotal", "hitDiceType"],
    ["hitDiceSecondaryUsed", "hitDiceSecondaryTotal", "hitDiceSecondaryType"],
  ].forEach(([usedKey, totalKey, typeKey]) => {
    const total = clampInteger(state.character[totalKey], 1, 20, 1);
    state.character[totalKey] = total;
    state.character[usedKey] = state.character[typeKey] === "N/A"
      ? 0
      : clampInteger(state.character[usedKey], 0, total, 0);
  });
}

function clampMoney() {
  Object.keys(defaultState.money).forEach((denomination) => {
    state.money[denomination] = clampInteger(
      state.money[denomination],
      0,
      Number.MAX_SAFE_INTEGER,
      0,
    );
  });
}

function syncCharacterHitDiceInputs() {
  [
    ["character.hitDiceUsed", "character.hitDiceTotal"],
    ["character.hitDiceSecondaryUsed", "character.hitDiceSecondaryTotal"],
  ].forEach(([usedPath, totalPath]) => {
    const usedInput = $(`[data-path='${usedPath}']`);
    const totalInput = $(`[data-path='${totalPath}']`);
    if (usedInput) {
      usedInput.max = String(getByPath(totalPath));
      syncPathInput(usedInput);
    }
    if (totalInput) syncPathInput(totalInput);
  });
}

function syncCharacterHpInputs() {
  const hpInput = $("[data-path='character.hp']");
  const totalHpInput = $("[data-path='character.totalHp']");
  if (hpInput) syncPathInput(hpInput);
  if (totalHpInput) syncPathInput(totalHpInput);
}

function syncRageInputs() {
  ["rage.total", "rage.used"].forEach((path) => {
    const input = $(`[data-path='${path}']`);
    if (input) syncPathInput(input);
  });
}

function clampFighterUses() {
  [
    ["secondWindUsed", "secondWindTotal"],
    ["actionSurgeUsed", "actionSurgeTotal"],
  ].forEach(([usedKey, totalKey]) => {
    const total = clampInteger(state.fighter[totalKey], 0, 99, 0);
    state.fighter[totalKey] = total;
    state.fighter[usedKey] = clampInteger(state.fighter[usedKey], 0, total, 0);
  });
}

function syncFighterInputs() {
  [
    ["fighter.secondWindUsed", "fighter.secondWindTotal"],
    ["fighter.actionSurgeUsed", "fighter.actionSurgeTotal"],
  ].forEach(([usedPath, totalPath]) => {
    const usedInput = $(`[data-path='${usedPath}']`);
    const totalInput = $(`[data-path='${totalPath}']`);
    if (usedInput) {
      usedInput.max = String(getByPath(totalPath));
      syncPathInput(usedInput);
    }
    if (totalInput) syncPathInput(totalInput);
  });
}

function getCharacterDisplayName() {
  return state.character.name.trim() || DEFAULT_CHARACTER_TITLE;
}

function syncCharacterNameTitle() {
  const display = $("#characterNameDisplay");
  if (!display) return;
  const displayName = getCharacterDisplayName();
  display.textContent = displayName;
  document.title = `${displayName} Field Sheet`;
}

function startCharacterNameEdit() {
  const title = $(".character-title");
  const input = $("#characterNameInput");
  if (!title || !input) return;
  title.classList.add("is-editing");
  input.value = state.character.name;
  input.focus();
  input.select();
}

function finishCharacterNameEdit({ save = true } = {}) {
  const title = $(".character-title");
  const input = $("#characterNameInput");
  if (!title || !input) return;
  if (save) {
    state.character.name = input.value.trim();
    saveState();
  } else {
    input.value = state.character.name;
  }
  title.classList.remove("is-editing");
  syncCharacterNameTitle();
}

function openArmorClassDialog() {
  const dialog = $("#acDialog");
  const valueInput = $("#acValueInput");
  const notesInput = $("#acNotesInput");
  valueInput.value = state.character.armorClass;
  notesInput.value = state.character.armorClassNotes;
  dialog.showModal();
  valueInput.focus();
  valueInput.select();
}

function closeArmorClassDialog() {
  $("#acDialog").close();
}

function saveArmorClass(event) {
  event.preventDefault();
  state.character.armorClass = clampInteger($("#acValueInput").value, 0, 99, 10);
  state.character.armorClassNotes = $("#acNotesInput").value;
  saveState();
  syncArmorClassShield();
  closeArmorClassDialog();
}

function adjustCharacterHp(amount) {
  const currentHp = Number(state.character.hp || 0);
  state.character.hp = currentHp + amount;
  saveState();
  syncCharacterHpInputs();
}

function takeShortRest() {
  state.rage.used = Math.max(0, Number(state.rage.used || 0) - 1);
  state.fighter.secondWindUsed = Math.max(0, Number(state.fighter.secondWindUsed || 0) - 1);
  saveState();
  syncRageInputs();
  syncFighterInputs();
}

function takeLongRest() {
  state.character.hp = Math.max(0, Number(state.character.totalHp || 0));
  state.character.hitDiceUsed = 0;
  state.character.hitDiceSecondaryUsed = 0;
  state.rage.used = 0;
  state.fighter.secondWindUsed = 0;
  saveState();
  syncCharacterHpInputs();
  syncCharacterHitDiceInputs();
  syncRageInputs();
  syncFighterInputs();
  showRestReminder();
}

function showRestReminder() {
  const toast = $("#restReminderToast");
  if (!toast) return;
  toast.hidden = false;
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");
}

function hideRestReminder() {
  const toast = $("#restReminderToast");
  if (!toast) return;
  toast.classList.remove("is-visible");
  toast.hidden = true;
}

function suppressRageTooltip(button) {
  const wrapper = button.closest(".fighter-button-wrap");
  if (!wrapper) return;
  wrapper.classList.add("tooltip-suppressed");
  button.blur();
  const restoreTooltip = () => wrapper.classList.remove("tooltip-suppressed");
  wrapper.addEventListener("pointerleave", restoreTooltip, { once: true });
  button.addEventListener("focus", restoreTooltip, { once: true });
}

function getAbilityModifier(score) {
  return Math.floor((Number(score || 0) - 10) / 2);
}

function formatModifier(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function getStatValue(statName) {
  return Number(state.stats.find((stat) => stat.name === statName)?.value || 0);
}

function getStat(statName) {
  return state.stats.find((stat) => stat.name === statName);
}

function getSavingThrowTotal(stat) {
  const abilityModifier = getAbilityModifier(stat.value);
  const proficiencyModifier = stat.saveProficient ? Number(state.character.proficiencyBonus || 0) : 0;
  return abilityModifier + Number(stat.saveModifier || 0) + proficiencyModifier;
}

function bindPathInputs() {
  $$("[data-path]").forEach((input) => {
    syncPathInput(input);
    const syncState = () => {
      const nextValue = input.type === "checkbox" ? input.checked : input.value;
      setByPath(input.dataset.path, input.type === "number" ? Number(nextValue) : nextValue);
      saveState();
      if (
        input.dataset.path === "character.hp" ||
        input.dataset.path === "character.totalHp"
      ) {
        syncCharacterHpInputs();
      }
      if (input.dataset.path.startsWith("character.hitDice")) {
        syncCharacterHitDiceInputs();
      }
      if (input.dataset.path.startsWith("money.")) {
        syncPathInput(input);
      }
      if (input.dataset.path.startsWith("fighter.")) {
        syncFighterInputs();
      }
    };
    input.addEventListener("input", syncState);
    input.addEventListener("change", syncState);
  });
  syncCharacterHitDiceInputs();
  syncFighterInputs();
}

function syncPathInputs() {
  $$("[data-path]").forEach(syncPathInput);
  syncCharacterHitDiceInputs();
  syncFighterInputs();
}

function syncPathInput(input) {
  const value = getByPath(input.dataset.path);
  if (input.type === "checkbox") {
    input.checked = Boolean(value);
  } else {
    input.value = value ?? "";
  }
}

function textInput(value, onInput, placeholder = "", type = "text") {
  const input = document.createElement("input");
  input.type = type;
  input.value = value ?? "";
  input.placeholder = placeholder;
  if (type === "number") input.inputMode = "numeric";
  input.addEventListener("input", () => {
    onInput(type === "number" ? Number(input.value) : input.value);
    saveState();
  });
  return input;
}

function textArea(value, onInput, placeholder = "") {
  const textarea = document.createElement("textarea");
  textarea.value = value ?? "";
  textarea.placeholder = placeholder;
  textarea.addEventListener("input", () => {
    onInput(textarea.value);
    saveState();
  });
  return textarea;
}

function labeled(label, control) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";
  const span = document.createElement("span");
  span.textContent = label;
  wrapper.append(span, control);
  return wrapper;
}

function removeButton(onClick, getUndoAction = null) {
  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.title = "Remove";
  button.textContent = "X";
  button.addEventListener("click", () => {
    if (getUndoAction) {
      const undoAction = getUndoAction();
      if (undoAction) queueUndoAction(undoAction);
    }
    onClick();
    saveState();
    renderDynamicSections();
  });
  return button;
}

function getSortTitle(value, fallback) {
  return (value || fallback).trim().toLowerCase();
}

function getSessionNoteSortValue(sessionNote) {
  const parsedDate = Date.parse(sessionNote.date || "");
  return Number.isNaN(parsedDate) ? Number.POSITIVE_INFINITY : parsedDate;
}

function sortSessionNotesByDate() {
  state.notes.sessions.sort((a, b) => {
    const sessionDifference = Number(b.sessionNumber || 0) - Number(a.sessionNumber || 0);
    if (sessionDifference !== 0) return sessionDifference;
    return getSessionNoteSortValue(b) - getSessionNoteSortValue(a);
  });
}

function syncSessionNotesCollapseButton() {
  const button = $("#toggleSessionNotesCollapse");
  if (!button) return;
  const hasExpandedNotes = state.notes.sessions.some((note) => note.expanded !== false);
  button.textContent = hasExpandedNotes ? "Collapse All" : "Expand All";
}

function moveArrayItem(array, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
  const [item] = array.splice(fromIndex, 1);
  array.splice(toIndex, 0, item);
}

function dragHandle(index) {
  const button = document.createElement("button");
  button.className = "icon-button drag-handle";
  button.type = "button";
  button.title = "Drag to reorder";
  button.setAttribute("aria-label", "Drag to reorder");
  button.draggable = true;
  button.textContent = "::";
  button.addEventListener("dragstart", (event) => {
    const card = button.closest(".row-card, .note-card");
    if (card) card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  });
  button.addEventListener("dragend", () => {
    const card = button.closest(".row-card, .note-card");
    if (card) card.classList.remove("is-dragging");
  });
  return button;
}

function makeDropTarget(card, index, onMove) {
  card.dataset.dragIndex = String(index);
  card.addEventListener("dragover", (event) => {
    event.preventDefault();
    card.classList.add("is-drag-over");
    event.dataTransfer.dropEffect = "move";
  });
  card.addEventListener("dragleave", () => {
    card.classList.remove("is-drag-over");
  });
  card.addEventListener("drop", (event) => {
    event.preventDefault();
    card.classList.remove("is-drag-over");
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(fromIndex)) return;
    onMove(fromIndex, index);
  });
}

function getGlobalSearchResults() {
  const query = globalSearchQuery.trim().toLowerCase();
  if (!query) return [];
  const results = [];
  const addResult = ({ section, title, fields, view, kind, index = null, category = null, key = null }) => {
    const normalizedFields = fields.map(([label, value]) => [label, String(value ?? "")]);
    let match = normalizedFields.find(([label, value]) => `${label} ${value}`.toLowerCase().includes(query));
    if (!match && section.toLowerCase().includes(query)) match = ["Section", section];
    if (!match) return;
    const [matchLabel, matchValue] = match;
    const compactValue = matchValue.replace(/\s+/g, " ").trim();
    const detail = compactValue && compactValue.toLowerCase() !== title.toLowerCase()
      ? `${matchLabel}: ${compactValue}`
      : `Matched ${matchLabel.toLowerCase()}`;
    results.push({
      section,
      title,
      detail: `${detail.slice(0, 150)}${detail.length > 150 ? "..." : ""}`,
      view,
      kind,
      index,
      category,
      key,
    });
  };

  addResult({
    section: "Character",
    title: state.character.name?.trim() || DEFAULT_CHARACTER_TITLE,
    fields: [
      ["Name", state.character.name],
      ["Level", state.character.level],
      ["Speed", state.character.speed],
      ["Current HP", state.character.hp],
      ["Temporary HP", state.character.tempHp],
      ["Total HP", state.character.totalHp],
      ["Armor Class", state.character.armorClass],
      ["AC Notes", state.character.armorClassNotes],
      ["Hit Dice", `${state.character.hitDiceUsed}/${state.character.hitDiceTotal} used ${state.character.hitDiceType}`],
      ["Hit Dice 2", `${state.character.hitDiceSecondaryUsed}/${state.character.hitDiceSecondaryTotal} used ${state.character.hitDiceSecondaryType}`],
      ["Proficiency Bonus", state.character.proficiencyBonus],
    ],
    view: "sheet",
    kind: "character",
  });

  state.stats.forEach((stat) => {
    addResult({
      section: "Stats & Skills",
      title: ABILITY_LABELS[stat.name] || stat.name,
      fields: [
        ["Ability", `${stat.name} ${ABILITY_LABELS[stat.name] || ""}`],
        ["Score", stat.value],
        ["Saving Throw", getSavingThrowTotal(stat)],
      ],
      view: "sheet",
      kind: "stat",
      key: stat.name,
    });
  });

  state.skills.forEach((skill) => {
    addResult({
      section: "Stats & Skills",
      title: skill.name,
      fields: [
        ["Skill", skill.name],
        ["Ability", `${skill.ability} ${ABILITY_LABELS[skill.ability] || ""}`],
        ["Modifier", skill.modifier],
        ["Proficient", skill.proficient ? "Yes" : "No"],
      ],
      view: "sheet",
      kind: "skill",
      key: skill.ability,
    });
  });

  addResult({
    section: "Rage",
    title: "Rage Tracker",
    fields: [
      ["Rages Total", state.rage.total],
      ["Rages Used", state.rage.used],
      ["Rage Status", state.rage.inRage ? "Raging" : "Not raging"],
    ],
    view: "combat",
    kind: "rage",
  });

  addResult({
    section: "Fighter",
    title: "Fighter Features",
    fields: [
      ["Second Wind", `${state.fighter.secondWindUsed}/${state.fighter.secondWindTotal} used`],
      ["Action Surge", `${state.fighter.actionSurgeUsed}/${state.fighter.actionSurgeTotal} used`],
    ],
    view: "combat",
    kind: "fighter",
  });

  EXPERIMENT_RAGES.forEach((serum) => {
    addResult({
      section: "Rage",
      title: serum.name,
      fields: [["Serum", serum.name], ["Summary", serum.summary], ["Details", serum.details]],
      view: "combat",
      kind: "serum",
      key: serum.key,
    });
  });

  state.actions.forEach((action, index) => {
    addResult({
      section: "Actions & Attacks",
      title: action.name?.trim() || "New Action",
      fields: [["Name", action.name], ["To Hit", action.toHit], ["Damage", action.damage], ["Description", action.description]],
      view: "combat",
      kind: "action",
      index,
    });
  });

  state.abilities.forEach((ability, index) => {
    addResult({
      section: "Abilities",
      title: ability.name?.trim() || "New Ability",
      fields: [["Name", ability.name], ["Description", ability.description]],
      view: "sheet",
      kind: "ability",
      index,
    });
  });

  state.inventory.forEach((item, index) => {
    addResult({
      section: "Inventory",
      title: item.name?.trim() || "Unnamed Item",
      fields: [["Name", item.name], ["Quantity", item.quantity], ["Description", item.notes]],
      view: "sheet",
      kind: "inventory",
      index,
    });
  });

  state.statuses.forEach((status, index) => {
    addResult({
      section: "Statuses",
      title: status.name?.trim() || "Unnamed Status",
      fields: [["Name", status.name], ["Duration", status.duration], ["Notes", status.notes], ["State", status.active ? "Active" : "Inactive"]],
      view: "sheet",
      kind: "status",
      index,
    });
  });

  addResult({
    section: "Notes",
    title: "Current Session Scratch Pad",
    fields: [["Scratch Pad", state.notes.sessionScratchPad]],
    view: "notes",
    kind: "scratchpad",
  });

  ["locations", "people", "plot", "backstory"].forEach((category) => {
    state.notes[category].forEach((note, index) => {
      const categoryLabel = `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
      addResult({
        section: `Notes - ${categoryLabel}`,
        title: note.title?.trim() || "Untitled Knowledge",
        fields: [["Title", note.title], ["Knowledge", note.body]],
        view: "notes",
        kind: "note",
        category,
        index,
      });
    });
  });

  state.notes.sessions.forEach((note, index) => {
    addResult({
      section: "Session Notes",
      title: Number(note.sessionNumber || 0) > 0 ? `Session ${note.sessionNumber}` : "Session Note",
      fields: [["Session", note.sessionNumber], ["Date", note.date], ["Notes", note.body]],
      view: "notes",
      kind: "session",
      index,
    });
  });

  return results;
}

function closeGlobalSearch() {
  const input = $("#globalSearchInput");
  const resultsContainer = $("#globalSearchResults");
  if (!input || !resultsContainer) return;
  resultsContainer.hidden = true;
  input.setAttribute("aria-expanded", "false");
}

function scrollToGlobalSearchTarget(selector) {
  requestAnimationFrame(() => {
    const target = $(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.remove("search-hit-highlight");
    requestAnimationFrame(() => target.classList.add("search-hit-highlight"));
    window.setTimeout(() => target.classList.remove("search-hit-highlight"), 1700);
  });
}

function openGlobalSearchResult(result) {
  setActiveView(result.view);
  let selector = "";
  if (result.kind === "character") {
    selector = ".character-panel";
  } else if (result.kind === "stat" || result.kind === "skill") {
    state.ui.collapsedSkillGroups[result.key] = false;
    saveState();
    renderSkills();
    selector = result.kind === "skill"
      ? `[data-skill-name="${result.title}"]`
      : `[data-skill-group="${result.key}"]`;
  } else if (result.kind === "rage") {
    selector = ".rage-panel";
  } else if (result.kind === "fighter") {
    selector = ".fighter-panel";
  } else if (result.kind === "serum") {
    state.rage.serumExpanded[result.key] = true;
    saveState();
    renderRageTypes();
    selector = `[data-serum-key="${result.key}"]`;
  } else if (result.kind === "action") {
    state.actions[result.index].expanded = true;
    saveState();
    renderActions();
    selector = `[data-action-index="${result.index}"]`;
  } else if (result.kind === "ability") {
    state.abilities[result.index].expanded = true;
    saveState();
    renderAbilities();
    selector = `[data-ability-index="${result.index}"]`;
  } else if (result.kind === "inventory") {
    activeInventoryFilter = null;
    if (state.inventory[result.index].hidden) showHiddenInventory = true;
    state.inventory[result.index].expanded = true;
    saveState();
    renderInventory();
    selector = `[data-inventory-index="${result.index}"]`;
  } else if (result.kind === "status") {
    if (!state.statuses[result.index].active) showInactiveStatuses = true;
    renderStatuses();
    selector = `[data-status-index="${result.index}"]`;
  } else if (result.kind === "scratchpad") {
    selector = ".scratch-pad-card";
  } else if (result.kind === "note") {
    activeNoteTab = result.category;
    activeNoteFilter = null;
    if (state.notes[result.category][result.index].hidden) showHiddenNotes = true;
    state.notes[result.category][result.index].expanded = true;
    saveState();
    syncNoteTabs();
    renderNotes();
    selector = `[data-note-category="${result.category}"][data-note-index="${result.index}"]`;
  } else if (result.kind === "session") {
    const sessionNote = state.notes.sessions[result.index];
    sessionNote.expanded = true;
    saveState();
    renderSessionNotes();
    selector = `[data-session-index="${state.notes.sessions.indexOf(sessionNote)}"]`;
  }
  closeGlobalSearch();
  $("#globalSearchInput")?.blur();
  if (selector) scrollToGlobalSearchTarget(selector);
}

function renderGlobalSearchResults() {
  const input = $("#globalSearchInput");
  const resultsContainer = $("#globalSearchResults");
  if (!input || !resultsContainer) return;
  resultsContainer.innerHTML = "";
  const hasQuery = Boolean(globalSearchQuery.trim());
  if (!hasQuery) {
    closeGlobalSearch();
    return;
  }
  const results = getGlobalSearchResults().slice(0, 30);
  resultsContainer.hidden = false;
  input.setAttribute("aria-expanded", "true");
  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "global-search-empty";
    empty.textContent = "No matches anywhere on this sheet.";
    resultsContainer.append(empty);
    return;
  }
  let previousSection = "";
  results.forEach((result) => {
    if (result.section !== previousSection) {
      const group = document.createElement("div");
      group.className = "global-search-group";
      group.textContent = result.section;
      resultsContainer.append(group);
      previousSection = result.section;
    }
    const button = document.createElement("button");
    button.className = "global-search-result";
    button.type = "button";
    const title = document.createElement("span");
    title.className = "global-search-result-title";
    title.textContent = result.title;
    const detail = document.createElement("span");
    detail.className = "global-search-result-detail";
    detail.textContent = result.detail;
    button.append(title, detail);
    button.addEventListener("click", () => openGlobalSearchResult(result));
    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeGlobalSearch();
        input.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const resultButtons = $$(".global-search-result");
      const currentIndex = resultButtons.indexOf(button);
      const nextIndex = event.key === "ArrowDown"
        ? Math.min(resultButtons.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
      resultButtons[nextIndex]?.focus();
    });
    resultsContainer.append(button);
  });
}

function renderChargesTracker(target) {
  const wrapper = document.createElement("div");
  wrapper.className = "charges-section";

  const countInput = textInput(target.chargesTotal ?? 0, (value) => {
    target.chargesTotal = Math.max(0, Number(value || 0));
    target.chargesUsed = Math.min(Number(target.chargesUsed || 0), target.chargesTotal);
    renderDots();
  }, "", "number");

  const dots = document.createElement("div");
  dots.className = "charge-dots";

  const renderDots = () => {
    dots.innerHTML = "";
    const total = Math.max(0, Number(target.chargesTotal || 0));
    const used = Math.min(Math.max(0, Number(target.chargesUsed || 0)), total);
    target.chargesUsed = used;
    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("button");
      dot.className = `charge-dot${index < used ? " is-filled" : ""}`;
      dot.type = "button";
      dot.title = `Charge ${index + 1}`;
      dot.setAttribute("aria-label", `Toggle charge ${index + 1}`);
      dot.addEventListener("click", () => {
        target.chargesUsed = index < Number(target.chargesUsed || 0) ? index : index + 1;
        saveState();
        renderDots();
      });
      dots.append(dot);
    }
  };

  wrapper.append(labeled("Charges", countInput), dots);
  renderDots();
  return wrapper;
}

function advantageTag() {
  const tag = document.createElement("span");
  tag.className = "advantage-tag";
  tag.textContent = "ADVANTAGE!";
  return tag;
}

function primalTag() {
  const tag = document.createElement("span");
  tag.className = "primal-tag";
  tag.textContent = "PRIMAL";
  return tag;
}

function skillMarker(type) {
  const marker = document.createElement("span");
  marker.className = `skill-marker skill-marker-${type}`;
  marker.textContent = "*";
  marker.setAttribute("aria-hidden", "true");
  return marker;
}

function renderSkills() {
  const grid = $("#skillsGrid");
  grid.innerHTML = "";
  const proficiencyBonusInput = $("#proficiencyBonus");
  if (proficiencyBonusInput) proficiencyBonusInput.value = Number(state.character.proficiencyBonus || 0);
  const primalSkills = new Set(["Acrobatics", "Intimidation", "Perception", "Stealth", "Survival"]);
  Object.keys(ABILITY_LABELS).forEach((ability) => {
    const groupedSkills = state.skills.filter((skill) => skill.ability === ability);
    const isCollapsed = Boolean(state.ui?.collapsedSkillGroups?.[ability]);

    const section = document.createElement("section");
    section.className = "skill-group";
    section.dataset.skillGroup = ability;
    if (isCollapsed) section.classList.add("is-collapsed");
    if (groupedSkills.length === 1) {
      section.classList.add("skill-group-compact");
    }

    const stat = getStat(ability);
    const skillScoreUpdaters = [];
    const heading = document.createElement("div");
    heading.className = "skill-group-heading";
    const titleWrap = document.createElement("div");
    titleWrap.className = "skill-group-title-wrap";
    const title = document.createElement("h3");
    title.className = "skill-group-title";
    title.textContent = ABILITY_LABELS[ability];
    const modifier = document.createElement("span");
    modifier.className = "skill-group-modifier";
    const updateAbilitySummary = () => {
      const abilityModifier = getAbilityModifier(getStatValue(ability));
      const savingThrow = stat ? getSavingThrowTotal(stat) : abilityModifier;
      const advantageMarker = ability === "STR" || ability === "DEX" ? "*" : "";
      modifier.textContent = `${ability} ${formatModifier(abilityModifier)}, SAVE ${formatModifier(savingThrow)}${advantageMarker}`;
      modifier.title = ability === "DEX"
        ? "Dexterity saving throws always have advantage"
        : ability === "STR"
          ? "Strength saving throws have advantage while raging"
          : "";
    };
    updateAbilitySummary();
    titleWrap.append(title, modifier);

    const scoreInput = document.createElement("input");
    scoreInput.type = "number";
    scoreInput.inputMode = "numeric";
    scoreInput.value = stat?.value ?? 0;
    scoreInput.addEventListener("input", () => {
      if (!stat) return;
      stat.value = Number(scoreInput.value || 0);
      saveScore.value = getSavingThrowTotal(stat);
      updateAbilitySummary();
      skillScoreUpdaters.forEach((updateScore) => updateScore());
      saveState();
    });

    const saveProficient = document.createElement("input");
    saveProficient.type = "checkbox";
    saveProficient.checked = Boolean(stat?.saveProficient);
    saveProficient.title = "Saving throw proficient";
    saveProficient.addEventListener("input", () => {
      if (!stat) return;
      stat.saveProficient = saveProficient.checked;
      saveScore.value = getSavingThrowTotal(stat);
      updateAbilitySummary();
      saveState();
    });

    const saveScore = document.createElement("input");
    saveScore.type = "number";
    saveScore.inputMode = "numeric";
    saveScore.value = stat ? getSavingThrowTotal(stat) : 0;
    saveScore.addEventListener("input", () => {
      if (!stat) return;
      const abilityModifier = getAbilityModifier(stat.value);
      const proficiencyModifier = stat.saveProficient ? Number(state.character.proficiencyBonus || 0) : 0;
      stat.saveModifier = Number(saveScore.value || 0) - abilityModifier - proficiencyModifier;
      updateAbilitySummary();
      saveState();
    });

    const controls = document.createElement("div");
    controls.className = "skill-group-controls";
    controls.append(
      labeled("Score", scoreInput),
    );
    const collapseButton = document.createElement("button");
    collapseButton.className = "icon-button skill-collapse-button";
    collapseButton.type = "button";
    collapseButton.textContent = isCollapsed ? "+" : "-";
    collapseButton.title = isCollapsed ? "Expand ability card" : "Collapse ability card";
    collapseButton.setAttribute("aria-label", collapseButton.title);
    collapseButton.addEventListener("click", () => {
      if (!state.ui.collapsedSkillGroups) state.ui.collapsedSkillGroups = {};
      state.ui.collapsedSkillGroups[ability] = !isCollapsed;
      saveState();
      renderSkills();
    });
    heading.append(titleWrap, controls, collapseButton);
    section.append(heading);

    if (!isCollapsed) {
      const saveRow = document.createElement("label");
      saveRow.className = "skill-row skill-save-row";
      const saveName = document.createElement("span");
      saveName.textContent = "SAVE";
      saveName.title = `${ABILITY_LABELS[ability]} save`;
      const saveLabel = document.createElement("span");
      saveLabel.className = "skill-label-with-tag";
      saveLabel.append(saveName);
      if (ability === "DEX") {
        saveLabel.append(advantageTag());
      } else if (state.rage.inRage && ability === "STR") {
        saveLabel.append(advantageTag());
      } else if (!state.rage.inRage && ability === "STR") {
        saveLabel.append(skillMarker("red"));
      }
      saveRow.append(saveProficient, saveLabel, saveScore);
      section.append(saveRow);
    }

    if (!isCollapsed) groupedSkills.forEach((skill) => {
      const row = document.createElement("label");
      row.className = "skill-row";
      row.dataset.skillName = skill.name;

      const proficient = document.createElement("input");
      proficient.type = "checkbox";
      proficient.checked = Boolean(skill.proficient);
      proficient.title = "Proficient";
      proficient.addEventListener("input", () => {
        skill.proficient = proficient.checked;
        saveState();
        renderSkills();
      });

      const name = document.createElement("span");
      name.textContent = skill.name;
      name.title = skill.name;
      const skillLabel = document.createElement("span");
      skillLabel.className = "skill-label-with-tag";
      skillLabel.append(name);
      if (state.rage.inRage && skill.name === "Athletics") {
        skillLabel.append(advantageTag());
      } else if (!state.rage.inRage && skill.name === "Athletics") {
        skillLabel.append(skillMarker("red"));
      }
      if (primalSkills.has(skill.name)) {
        skillLabel.append(state.rage.inRage ? primalTag() : skillMarker("blue"));
      }

      const score = document.createElement("input");
      score.type = "number";
      score.inputMode = "numeric";
      const updateScore = () => {
        const abilityModifier = getAbilityModifier(getStatValue(skill.ability));
        const proficiencyModifier = skill.proficient ? Number(state.character.proficiencyBonus || 0) : 0;
        score.value = abilityModifier + Number(skill.modifier || 0) + proficiencyModifier;
      };
      updateScore();
      skillScoreUpdaters.push(updateScore);
      score.addEventListener("input", () => {
        const abilityModifier = getAbilityModifier(getStatValue(skill.ability));
        const proficiencyModifier = skill.proficient ? Number(state.character.proficiencyBonus || 0) : 0;
        const enteredValue = Number(score.value || 0);
        skill.modifier = enteredValue - abilityModifier - proficiencyModifier;
        saveState();
      });

      row.append(proficient, skillLabel, score);
      section.append(row);
    });

    grid.append(section);
  });
}

function renderRageTypes() {
  const list = $("#rageTypes");
  list.innerHTML = "";
  list.classList.add("rage-serum-grid");
  EXPERIMENT_RAGES.forEach((serum) => {
    const card = document.createElement("div");
    const isActive = state.rage.inRage && state.rage.activeType === serum.key;
    const expanded = Boolean(state.rage.serumExpanded?.[serum.key]);
    card.className = `rage-serum-card${isActive ? " is-active" : ""}`;
    card.dataset.serumKey = serum.key;

    const header = document.createElement("div");
    header.className = "rage-serum-header";

    const title = document.createElement("div");
    title.className = "action-title";
    const name = document.createElement("h3");
    name.className = "action-name";
    name.textContent = serum.name;
    title.append(name);

    const controls = document.createElement("div");
    controls.className = "action-controls rage-serum-controls";

    const selectButton = document.createElement("button");
    selectButton.className = `small-button rage-serum-select${isActive ? " is-active" : ""}`;
    selectButton.type = "button";
    selectButton.textContent = isActive ? "Active" : state.rage.inRage ? "Swap" : "Select";
    selectButton.addEventListener("click", () => enterRageWithSerum(serum.key));

    const expandButton = document.createElement("button");
    expandButton.className = "small-button action-toggle";
    expandButton.type = "button";
    expandButton.textContent = expanded ? "-" : "+";
    expandButton.title = expanded ? "Collapse details" : "Expand details";
    expandButton.setAttribute("aria-label", expandButton.title);
    expandButton.addEventListener("click", () => {
      state.rage.serumExpanded[serum.key] = !expanded;
      saveState();
      renderRageTypes();
    });

    controls.append(selectButton, expandButton);
    header.append(title, controls);

    const details = document.createElement("div");
    details.className = "rage-serum-details";
    details.hidden = !expanded;
    const expandedSummary = document.createElement("p");
    expandedSummary.className = "rage-serum-expanded-summary";
    expandedSummary.textContent = serum.summary;
    const description = document.createElement("p");
    description.className = "rage-serum-description";
    description.textContent = serum.details;
    details.append(expandedSummary, description);

    card.append(header, details);
    list.append(card);
  });
}

function renderActions() {
  const list = $("#actionsList");
  list.innerHTML = "";
  list.classList.add("actions-grid");
  syncRecklessButton();
  state.actions.forEach((action, index) => {
    const card = document.createElement("div");
    card.className = "row-card action-card";
    card.dataset.actionIndex = String(index);
    card.classList.toggle("is-reckless", Boolean(state.ui.reckless));
    const handle = dragHandle(index);
    makeDropTarget(card, index, (fromIndex, toIndex) => {
      moveArrayItem(state.actions, fromIndex, toIndex);
      saveState();
      renderActions();
    });

    const expanded = action.expanded !== false;
    const header = document.createElement("div");
    header.className = "action-card-header";

    const title = document.createElement("div");
    title.className = "action-title";
    const name = document.createElement("h3");
    name.className = "action-name";
    const summary = document.createElement("div");
    summary.className = "action-summary";
    const updateActionHeader = () => {
      name.textContent = action.name || "New Action";
      summary.textContent = `${action.toHit || "No to-hit"} • ${action.damage || "No damage"}`;
    };
    updateActionHeader();
    title.append(name);
    if (state.ui.reckless) {
      const advantageTag = document.createElement("span");
      advantageTag.className = "advantage-tag";
      advantageTag.textContent = "ADVANTAGE!";
      title.append(advantageTag);
    }
    title.append(summary);

    const controls = document.createElement("div");
    controls.className = "action-controls";
    const toggle = document.createElement("button");
    toggle.className = "small-button action-toggle";
    toggle.type = "button";
    toggle.textContent = expanded ? "-" : "+";
    toggle.title = expanded ? "Collapse" : "Expand";
    toggle.setAttribute("aria-label", toggle.title);
    const details = document.createElement("div");
    details.className = "action-details";
    details.hidden = !expanded;
    toggle.addEventListener("click", () => {
      const nextExpanded = details.hidden;
      details.hidden = !nextExpanded;
      action.expanded = nextExpanded;
      toggle.textContent = nextExpanded ? "-" : "+";
      toggle.title = nextExpanded ? "Collapse" : "Expand";
      toggle.setAttribute("aria-label", toggle.title);
      saveState();
    });
    controls.append(handle, toggle, removeButton(
      () => state.actions.splice(index, 1),
      () => {
        const deletedAction = clone(action);
        return {
          label: "Remove Action",
          restore: () => state.actions.splice(Math.min(index, state.actions.length), 0, clone(deletedAction)),
        };
      },
    ));
    header.append(title, controls);

    details.append(
      labeled("Name", textInput(action.name, (value) => {
        action.name = value;
        updateActionHeader();
      }, "Attack or action")),
      labeled("To Hit", textInput(action.toHit, (value) => {
        action.toHit = value;
        updateActionHeader();
      }, "+5")),
      labeled("Damage", textInput(action.damage, (value) => {
        action.damage = value;
        updateActionHeader();
      }, "1d12 + 3")),
      labeled("Description", textArea(action.description, (value) => {
        action.description = value;
      }, "Range, target, effects, rage notes")),
      renderChargesTracker(action),
    );

    card.append(header, details);
    list.append(card);
  });
  renderEmpty(list, "No actions yet. Add the things you can do before the table gets loud.");
}

function renderAbilities() {
  const list = $("#abilitiesList");
  list.innerHTML = "";
  list.classList.add("actions-grid");
  state.abilities.forEach((ability, index) => {
    const card = document.createElement("div");
    card.className = "row-card action-card";
    card.dataset.abilityIndex = String(index);
    const handle = dragHandle(index);
    makeDropTarget(card, index, (fromIndex, toIndex) => {
      moveArrayItem(state.abilities, fromIndex, toIndex);
      saveState();
      renderAbilities();
    });

    const expanded = ability.expanded !== false;
    const header = document.createElement("div");
    header.className = "action-card-header";

    const title = document.createElement("div");
    title.className = "action-title";
    const name = document.createElement("h3");
    name.className = "action-name";
    const summary = document.createElement("div");
    summary.className = "action-summary";
    const updateAbilityHeader = () => {
      name.textContent = ability.name || "New Ability";
      const description = ability.description?.replace(/\s+/g, " ").trim() || "";
      summary.textContent = description
        ? `${description.slice(0, 96)}${description.length > 96 ? "..." : ""}`
        : "No description";
    };
    updateAbilityHeader();
    title.append(name, summary);

    const controls = document.createElement("div");
    controls.className = "action-controls";
    const toggle = document.createElement("button");
    toggle.className = "small-button action-toggle";
    toggle.type = "button";
    toggle.textContent = expanded ? "-" : "+";
    toggle.title = expanded ? "Collapse" : "Expand";
    toggle.setAttribute("aria-label", toggle.title);
    const details = document.createElement("div");
    details.className = "action-details";
    details.hidden = !expanded;
    toggle.addEventListener("click", () => {
      const nextExpanded = details.hidden;
      details.hidden = !nextExpanded;
      ability.expanded = nextExpanded;
      toggle.textContent = nextExpanded ? "-" : "+";
      toggle.title = nextExpanded ? "Collapse" : "Expand";
      toggle.setAttribute("aria-label", toggle.title);
      saveState();
    });
    controls.append(handle, toggle, removeButton(
      () => state.abilities.splice(index, 1),
      () => {
        const deletedAbility = clone(ability);
        return {
          label: "Remove Ability",
          restore: () => state.abilities.splice(Math.min(index, state.abilities.length), 0, clone(deletedAbility)),
        };
      },
    ));
    header.append(title, controls);

    details.append(
      labeled("Name", textInput(ability.name, (value) => {
        ability.name = value;
        updateAbilityHeader();
      }, "Ability or feature")),
      labeled("Description", textArea(ability.description, (value) => {
        ability.description = value;
        updateAbilityHeader();
      }, "Save DC, range, target, uses, effect")),
      renderChargesTracker(ability),
    );

    card.append(header, details);
    list.append(card);
  });
  renderEmpty(list, "No abilities yet. Add features, powers, or strange experiment tricks.");
}

function toggleRageState() {
  if (state.rage.inRage) {
    state.rage.inRage = false;
    state.rage.activeType = "";
    state.rage.choosingType = false;
    saveState();
    syncRageInputs();
    renderDynamicSections();
    return;
  }

  const remaining = Math.max(0, Number(state.rage.total || 0) - Number(state.rage.used || 0));
  if (remaining <= 0) return;

  state.rage.choosingType = true;
  saveState();
  syncRageInputs();
  renderDynamicSections();
}

function enterRageWithSerum(serumKey) {
  if (state.rage.inRage) {
    state.rage.activeType = serumKey;
    state.rage.choosingType = false;
    saveState();
    syncRageInputs();
    renderDynamicSections();
    return;
  }
  const remaining = Math.max(0, Number(state.rage.total || 0) - Number(state.rage.used || 0));
  if (remaining <= 0) return;
  state.rage.inRage = true;
  state.rage.choosingType = false;
  state.rage.activeType = serumKey;
  state.rage.used = Number(state.rage.used || 0) + 1;
  saveState();
  syncRageInputs();
  renderDynamicSections();
}

function triggerFeatureFlash(type) {
  const overlay = $("#featureFlashOverlay");
  if (!overlay) return;
  window.clearTimeout(featureFlashTimer);
  overlay.classList.remove("flash-second-wind", "flash-action-surge");
  void overlay.offsetWidth;
  overlay.classList.add(`flash-${type}`);
  featureFlashTimer = window.setTimeout(() => {
    overlay.classList.remove("flash-second-wind", "flash-action-surge");
  }, 1000);
}

function useFighterFeature(feature) {
  const featureState = {
    secondWind: {
      usedKey: "secondWindUsed",
      totalKey: "secondWindTotal",
      flash: "second-wind",
    },
    actionSurge: {
      usedKey: "actionSurgeUsed",
      totalKey: "actionSurgeTotal",
      flash: "action-surge",
    },
  }[feature];
  if (!featureState) return;
  const remaining = state.fighter[featureState.totalKey] - state.fighter[featureState.usedKey];
  if (remaining <= 0) return;
  state.fighter[featureState.usedKey] += 1;
  saveState();
  syncFighterInputs();
  triggerFeatureFlash(featureState.flash);
}

function renderInventory() {
  const inventory = $("#inventoryList");
  inventory.innerHTML = "";
  const items = state.inventory
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => showHiddenInventory || !item.hidden)
    .filter(({ index }) => !activeInventoryFilter || activeInventoryFilter.index === index);

  items.forEach(({ item, index }) => {
    const card = document.createElement("div");
    card.className = "row-card inventory-card";
    card.dataset.inventoryIndex = String(index);
    card.classList.toggle("is-hidden-card", Boolean(item.hidden));
    let handle = null;
    if (!activeInventoryFilter) {
      handle = dragHandle(index);
      makeDropTarget(card, index, (fromIndex, toIndex) => {
        moveArrayItem(state.inventory, fromIndex, toIndex);
        saveState();
        renderInventory();
        renderInventorySearchResults();
      });
    }

    const expanded = item.expanded !== false;
    const header = document.createElement("div");
    header.className = "inventory-card-header";

    const title = document.createElement("div");
    title.className = "action-title";
    const name = document.createElement("h3");
    name.className = "action-name";
    const summary = document.createElement("div");
    summary.className = "action-summary";
    const updateInventoryHeader = () => {
      name.textContent = item.name || "New Item";
      const notes = item.notes?.replace(/\s+/g, " ").trim() || "";
      const preview = notes.length > 64 ? `${notes.slice(0, 64)}...` : notes;
      summary.textContent = preview;
      summary.hidden = !preview;
    };
    updateInventoryHeader();
    title.append(name, summary);

    const controls = document.createElement("div");
    controls.className = "action-controls";
    const hideButton = document.createElement("button");
    hideButton.className = "small-button inventory-visibility-button";
    hideButton.type = "button";
    hideButton.textContent = item.hidden ? "Unhide" : "Hide";
    hideButton.addEventListener("click", () => {
      item.hidden = !item.hidden;
      activeInventoryFilter = null;
      saveState();
      renderInventory();
      renderInventorySearchResults();
    });
    const toggle = document.createElement("button");
    toggle.className = "small-button action-toggle";
    toggle.type = "button";
    toggle.textContent = expanded ? "-" : "+";
    toggle.title = expanded ? "Collapse" : "Expand";
    toggle.setAttribute("aria-label", toggle.title);
    const details = document.createElement("div");
    details.className = "inventory-details";
    details.hidden = !expanded;
    toggle.addEventListener("click", () => {
      const nextExpanded = details.hidden;
      details.hidden = !nextExpanded;
      item.expanded = nextExpanded;
      toggle.textContent = nextExpanded ? "-" : "+";
      toggle.title = nextExpanded ? "Collapse" : "Expand";
      toggle.setAttribute("aria-label", toggle.title);
      saveState();
    });
    if (handle) controls.append(handle);
    controls.append(hideButton, toggle, removeButton(
      () => {
        activeInventoryFilter = null;
        state.inventory.splice(index, 1);
      },
      () => {
        const deletedItem = clone(item);
        return {
          label: "Remove Item",
          restore: () => {
            activeInventoryFilter = null;
            state.inventory.splice(Math.min(index, state.inventory.length), 0, clone(deletedItem));
          },
        };
      },
    ));
    header.append(title, controls);

    details.append(
      labeled("Item", textInput(item.name, (value) => {
        item.name = value;
        updateInventoryHeader();
        renderInventorySearchResults();
      }, "Item name")),
      labeled("Qty", textInput(item.quantity, (value) => {
        item.quantity = value;
      }, "", "number")),
      labeled("Description", textArea(item.notes, (value) => {
        item.notes = value;
        updateInventoryHeader();
        renderInventorySearchResults();
      }, "Weight, attunement, odd smell, where you got it")),
      renderChargesTracker(item),
    );
    card.append(header, details);
    inventory.append(card);
  });
  syncHiddenInventoryButton();
  syncInventoryFilterButton();
  renderEmpty(inventory, activeInventoryFilter ? "No matching equipment in this filtered view." : "Inventory is empty.");
}

function getInventorySearchResults() {
  const query = inventorySearchQuery.trim().toLowerCase();
  if (!query) return [];
  const nameMatches = [];
  const detailMatches = [];
  const hiddenNameMatches = [];
  const hiddenDetailMatches = [];
  state.inventory.forEach((item, index) => {
    const name = item.name || "";
    const notes = item.notes || "";
    const result = { item, index };
    const targetNameMatches = item.hidden ? hiddenNameMatches : nameMatches;
    const targetDetailMatches = item.hidden ? hiddenDetailMatches : detailMatches;
    if (name.toLowerCase().includes(query)) {
      targetNameMatches.push({ ...result, matchType: item.hidden ? "Hidden Name" : "Name" });
    } else if (notes.toLowerCase().includes(query)) {
      targetDetailMatches.push({ ...result, matchType: item.hidden ? "Hidden Description" : "Description" });
    }
  });
  return [...nameMatches, ...detailMatches, ...hiddenNameMatches, ...hiddenDetailMatches];
}

function renderInventorySearchResults() {
  const resultsContainer = $("#inventorySearchResults");
  if (!resultsContainer) return;
  resultsContainer.innerHTML = "";
  const results = getInventorySearchResults();
  if (!inventorySearchQuery.trim()) return;
  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "inventory-search-empty";
    empty.textContent = "No equipment found.";
    resultsContainer.append(empty);
    return;
  }
  results.slice(0, 12).forEach((result) => {
    const button = document.createElement("button");
    button.className = "inventory-search-result";
    button.type = "button";
    const title = result.item.name?.trim() || "Unnamed Item";
    const notes = result.item.notes?.replace(/\s+/g, " ").trim() || "No description yet.";
    const titleLine = document.createElement("span");
    titleLine.className = "inventory-search-title";
    titleLine.textContent = title;
    const meta = document.createElement("span");
    meta.className = "inventory-search-meta";
    meta.textContent = `Qty ${result.item.quantity || 0} - ${result.matchType}`;
    const snippet = document.createElement("span");
    snippet.className = "inventory-search-snippet";
    snippet.textContent = `${notes.slice(0, 140)}${notes.length > 140 ? "..." : ""}`;
    button.append(titleLine, meta, snippet);
    button.addEventListener("click", () => openFilteredInventoryItem(result.index));
    resultsContainer.append(button);
  });
}

function openFilteredInventoryItem(index) {
  activeInventoryFilter = { index };
  if (state.inventory[index].hidden) showHiddenInventory = true;
  state.inventory[index].expanded = true;
  saveState();
  renderInventory();
}

function clearInventoryFilter() {
  activeInventoryFilter = null;
  renderInventory();
}

function syncInventoryFilterButton() {
  const button = $("#clearInventoryFilter");
  if (!button) return;
  button.hidden = !activeInventoryFilter;
}

function syncHiddenInventoryButton() {
  const button = $("#toggleHiddenInventory");
  if (!button) return;
  const hiddenCount = state.inventory.filter((item) => item.hidden).length;
  button.textContent = showHiddenInventory ? `Hide (${hiddenCount})` : `Show Hidden (${hiddenCount})`;
}

function toggleHiddenInventory() {
  showHiddenInventory = !showHiddenInventory;
  activeInventoryFilter = null;
  renderInventory();
  renderInventorySearchResults();
}

function sortInventoryAlphabetically() {
  activeInventoryFilter = null;
  state.inventory.sort((a, b) => getSortTitle(a.name, "New Item").localeCompare(getSortTitle(b.name, "New Item")));
  saveState();
  renderInventory();
  renderInventorySearchResults();
}

function syncRecklessButton() {
  const button = $("#recklessToggle");
  if (!button) return;
  const reckless = Boolean(state.ui.reckless);
  button.textContent = reckless ? "ADV on Attacks against you!" : "Reckless!";
  button.classList.toggle("is-active", reckless);
}

function toggleReckless() {
  state.ui.reckless = !state.ui.reckless;
  saveState();
  renderActions();
}

function renderStatuses() {
  const list = $("#statusesList");
  list.innerHTML = "";
  const activeStatuses = [];
  const inactiveStatuses = [];
  state.statuses.forEach((status, index) => {
    (status.active ? activeStatuses : inactiveStatuses).push({ status, index });
  });

  activeStatuses.forEach(({ status, index }) => {
    list.append(renderStatusRow(status, index));
  });

  if (inactiveStatuses.length) {
    const library = document.createElement("div");
    library.className = "status-library";

    const libraryHeader = document.createElement("div");
    libraryHeader.className = "status-library-label";
    libraryHeader.textContent = `Inactive Statuses (${inactiveStatuses.length})`;

    library.append(libraryHeader);

    if (showInactiveStatuses) {
      const inactiveList = document.createElement("div");
      inactiveList.className = "table-list";
      inactiveStatuses.forEach(({ status, index }) => {
        inactiveList.append(renderStatusRow(status, index));
      });
      library.append(inactiveList);
    }

    list.append(library);
  }

  syncInactiveToggle();
  renderEmpty(list, "No statuses in your tracker yet.");
}

function renderStatusRow(status, index) {
  const row = document.createElement("div");
  row.className = `status-row ${status.active ? "is-active" : "is-inactive"}`;
  row.dataset.statusIndex = String(index);

  const topLine = document.createElement("div");
  topLine.className = "status-row-top";

  const toggle = document.createElement("label");
  toggle.className = "status-toggle";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(status.active);
  checkbox.addEventListener("input", () => {
    status.active = checkbox.checked;
    saveState();
    renderStatuses();
  });
  const statusName = textInput(status.name, (value) => {
    status.name = value;
  }, "Poisoned, frightened, blessed");
  toggle.append(checkbox, statusName);

  const duration = textInput(status.duration, (value) => {
    status.duration = value;
  }, "1min");
  duration.className = "status-duration";
  duration.size = 4;
  duration.setAttribute("aria-label", "Duration");
  duration.title = "Duration";

  topLine.append(toggle, duration, removeButton(
    () => state.statuses.splice(index, 1),
    () => {
      const deletedStatus = clone(status);
      return {
        label: "Remove Status",
        restore: () => state.statuses.splice(Math.min(index, state.statuses.length), 0, clone(deletedStatus)),
      };
    },
  ));

  const details = document.createElement("div");
  details.className = "status-details";
  details.hidden = !status.active && !showInactiveStatuses;
  details.append(
    labeled("Notes", textArea(status.notes, (value) => {
      status.notes = value;
    }, "Save DC, source, reminder")),
  );

  row.append(topLine, details);
  return row;
}

function syncInactiveToggle() {
  const button = $("#toggleInactiveStatuses");
  if (!button) return;
  const inactiveCount = state.statuses.filter((status) => !status.active).length;
  button.textContent = showInactiveStatuses
    ? `Hide Inactive${inactiveCount ? ` (${inactiveCount})` : ""}`
    : `Show Inactive${inactiveCount ? ` (${inactiveCount})` : ""}`;
}

function renderNotes() {
  const list = $("#notesList");
  list.innerHTML = "";
  const notes = state.notes[activeNoteTab]
    .map((note, index) => ({ note, index }))
    .filter(({ note }) => showHiddenNotes || !note.hidden)
    .filter(({ index }) => !activeNoteFilter || activeNoteFilter.category === activeNoteTab && activeNoteFilter.index === index);

  notes.forEach(({ note, index }) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.dataset.noteCategory = activeNoteTab;
    card.dataset.noteIndex = String(index);
    card.classList.toggle("is-hidden-card", Boolean(note.hidden));
    let handle = null;
    if (!activeNoteFilter) {
      handle = dragHandle(index);
      makeDropTarget(card, index, (fromIndex, toIndex) => {
        moveArrayItem(state.notes[activeNoteTab], fromIndex, toIndex);
        saveState();
        renderNotes();
        renderNoteSearchResults();
      });
    }
    const expanded = note.expanded === true;

    const header = document.createElement("div");
    header.className = "note-card-header";

    const toggle = document.createElement("button");
    toggle.className = "note-card-toggle";
    toggle.type = "button";

    const titleWrap = document.createElement("div");
    titleWrap.className = "action-title";
    const name = document.createElement("h3");
    name.className = "action-name";
    const summary = document.createElement("div");
    summary.className = "action-summary";
    const updateNoteHeader = () => {
      const trimmedTitle = note.title?.trim();
      const trimmedBody = note.body?.replace(/\s+/g, " ").trim();
      name.textContent = trimmedTitle || "Untitled Knowledge";
      summary.textContent = trimmedBody
        ? `${trimmedBody.slice(0, 120)}${trimmedBody.length > 120 ? "..." : ""}`
        : "Click to expand note details";
    };
    updateNoteHeader();
    titleWrap.append(name, summary);

    const indicator = document.createElement("span");
    indicator.className = "note-card-indicator";
    indicator.textContent = expanded ? "-" : "+";
    indicator.setAttribute("aria-hidden", "true");

    toggle.append(titleWrap, indicator);

    const controls = document.createElement("div");
    controls.className = "action-controls";
    const hideButton = document.createElement("button");
    hideButton.className = "small-button";
    hideButton.type = "button";
    hideButton.textContent = note.hidden ? "Unhide" : "Hide";
    hideButton.addEventListener("click", () => {
      note.hidden = !note.hidden;
      activeNoteFilter = null;
      saveState();
      renderNotes();
      renderNoteSearchResults();
    });
    if (handle) controls.append(handle);
    controls.append(hideButton, removeButton(
      () => state.notes[activeNoteTab].splice(index, 1),
      () => {
        const category = activeNoteTab;
        const deletedNote = clone(note);
        return {
          label: "Remove Note",
          restore: () => {
            activeNoteTab = category;
            activeNoteFilter = null;
            state.notes[category].splice(Math.min(index, state.notes[category].length), 0, clone(deletedNote));
          },
        };
      },
    ));

    const details = document.createElement("div");
    details.className = "note-details";
    details.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.addEventListener("click", () => {
      const nextExpanded = details.hidden;
      details.hidden = !nextExpanded;
      note.expanded = nextExpanded;
      toggle.setAttribute("aria-expanded", String(nextExpanded));
      indicator.textContent = nextExpanded ? "-" : "+";
      saveState();
    });

    details.append(
      labeled("Name", textInput(note.title, (value) => {
        note.title = value;
        updateNoteHeader();
        renderNoteSearchResults();
      }, "Name or clue")),
      labeled("Knowledge", textArea(note.body, (value) => {
        note.body = value;
        updateNoteHeader();
        renderNoteSearchResults();
      }, "What changed, who said it, why it matters")),
    );
    header.append(toggle, controls);
    card.append(header, details);
    list.append(card);
  });
  syncHiddenNotesButton();
  syncNoteFilterButton();
  renderEmpty(list, activeNoteFilter ? "No matching knowledge in this filtered view." : `No ${activeNoteTab} notes yet.`);
}

function renderSessionNotes() {
  const list = $("#sessionNotesList");
  if (!list) return;
  list.innerHTML = "";
  sortSessionNotesByDate();

  state.notes.sessions.forEach((sessionNote, index) => {
    const card = document.createElement("div");
    card.className = "row-card session-note-card";
    card.dataset.sessionIndex = String(index);

    const expanded = sessionNote.expanded !== false;
    const header = document.createElement("div");
    header.className = "note-card-header";

    const toggle = document.createElement("button");
    toggle.className = "note-card-toggle";
    toggle.type = "button";

    const titleWrap = document.createElement("div");
    titleWrap.className = "action-title";
    const name = document.createElement("h3");
    name.className = "action-name";
    const summary = document.createElement("div");
    summary.className = "action-summary";
    const updateSessionHeader = () => {
      const sessionLabel = Number(sessionNote.sessionNumber || 0) > 0 ? `Session ${sessionNote.sessionNumber}` : "Session Note";
      const dateLabel = sessionNote.date || "No date yet";
      const bodyPreview = sessionNote.body?.replace(/\s+/g, " ").trim();
      name.textContent = sessionLabel;
      summary.textContent = bodyPreview
        ? `${dateLabel} - ${bodyPreview.slice(0, 110)}${bodyPreview.length > 110 ? "..." : ""}`
        : `${dateLabel} - Click to expand session details`;
    };
    updateSessionHeader();
    titleWrap.append(name, summary);

    const indicator = document.createElement("span");
    indicator.className = "note-card-indicator";
    indicator.textContent = expanded ? "-" : "+";
    indicator.setAttribute("aria-hidden", "true");
    toggle.append(titleWrap, indicator);

    const controls = document.createElement("div");
    controls.className = "action-controls";
    controls.append(removeButton(
      () => state.notes.sessions.splice(index, 1),
      () => {
        const deletedSession = clone(sessionNote);
        return {
          label: "Remove Session",
          restore: () => state.notes.sessions.splice(Math.min(index, state.notes.sessions.length), 0, clone(deletedSession)),
        };
      },
    ));

    const details = document.createElement("div");
    details.className = "session-note-details";
    details.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.addEventListener("click", () => {
      const nextExpanded = details.hidden;
      details.hidden = !nextExpanded;
      sessionNote.expanded = nextExpanded;
      toggle.setAttribute("aria-expanded", String(nextExpanded));
      indicator.textContent = nextExpanded ? "-" : "+";
      saveState();
      syncSessionNotesCollapseButton();
    });

    const sessionMeta = document.createElement("div");
    sessionMeta.className = "session-note-meta";

    const sessionNumberInput = textInput(sessionNote.sessionNumber, (value) => {
      sessionNote.sessionNumber = Number(value || 0);
      updateSessionHeader();
    }, "12", "number");
    sessionNumberInput.addEventListener("blur", () => {
      sortSessionNotesByDate();
      saveState();
      renderSessionNotes();
    });

    sessionMeta.append(
      labeled("Session #", sessionNumberInput),
      labeled("Date", textInput(sessionNote.date, (value) => {
        sessionNote.date = value;
        sortSessionNotesByDate();
        updateSessionHeader();
        saveState();
        renderSessionNotes();
      }, "", "date")),
    );

    details.append(
      sessionMeta,
      labeled("Session Notes", textArea(sessionNote.body, (value) => {
        sessionNote.body = value;
        updateSessionHeader();
      }, "Recap what happened, discoveries, NPCs, loot, and next steps")),
    );

    header.append(toggle, controls);
    card.append(header, details);
    list.append(card);
  });

  syncSessionNotesCollapseButton();
  renderEmpty(list, "No session notes yet.");
}

function getNoteSearchResults() {
  const query = noteSearchQuery.trim().toLowerCase();
  if (!query) return [];
  const titleMatches = [];
  const detailMatches = [];
  const hiddenTitleMatches = [];
  const hiddenDetailMatches = [];
  ["locations", "people", "plot", "backstory"].forEach((category) => {
    state.notes[category].forEach((note, index) => {
      const title = note.title || "";
      const body = note.body || "";
      const result = { category, index, note };
      const targetTitleMatches = note.hidden ? hiddenTitleMatches : titleMatches;
      const targetDetailMatches = note.hidden ? hiddenDetailMatches : detailMatches;
      if (title.toLowerCase().includes(query)) {
        targetTitleMatches.push({ ...result, matchType: note.hidden ? "Hidden Title" : "Title" });
      } else if (body.toLowerCase().includes(query)) {
        targetDetailMatches.push({ ...result, matchType: note.hidden ? "Hidden Details" : "Details" });
      }
    });
  });
  state.notes.sessions.forEach((note, index) => {
    const sessionLabel = Number(note.sessionNumber || 0) > 0 ? `Session ${note.sessionNumber}` : "Session Note";
    const date = note.date || "";
    const body = note.body || "";
    const result = { category: "sessions", index, note };
    if (sessionLabel.toLowerCase().includes(query)) {
      titleMatches.push({ ...result, matchType: "Session #" });
    } else if (date.toLowerCase().includes(query)) {
      detailMatches.push({ ...result, matchType: "Date" });
    } else if (body.toLowerCase().includes(query)) {
      detailMatches.push({ ...result, matchType: "Session Notes" });
    }
  });
  return [...titleMatches, ...detailMatches, ...hiddenTitleMatches, ...hiddenDetailMatches];
}

function renderNoteSearchResults() {
  const resultsContainer = $("#noteSearchResults");
  if (!resultsContainer) return;
  resultsContainer.innerHTML = "";
  const results = getNoteSearchResults();
  if (!noteSearchQuery.trim()) return;
  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "note-search-empty";
    empty.textContent = "No knowledge found.";
    resultsContainer.append(empty);
    return;
  }
  results.slice(0, 12).forEach((result) => {
    const button = document.createElement("button");
    button.className = "note-search-result";
    button.type = "button";
    const isSessionResult = result.category === "sessions";
    const title = isSessionResult
      ? (Number(result.note.sessionNumber || 0) > 0 ? `Session ${result.note.sessionNumber}` : "Session Note")
      : result.note.title?.trim() || "Untitled Knowledge";
    const body = result.note.body?.replace(/\s+/g, " ").trim() || "No details yet.";
    const titleLine = document.createElement("span");
    titleLine.className = "note-search-title";
    titleLine.textContent = title;
    const meta = document.createElement("span");
    meta.className = "note-search-meta";
    meta.textContent = `${isSessionResult ? "sessions" : result.category} - ${result.matchType}`;
    const snippet = document.createElement("span");
    snippet.className = "note-search-snippet";
    snippet.textContent = isSessionResult && result.note.date
      ? `${result.note.date} - ${body.slice(0, 140)}${body.length > 140 ? "..." : ""}`
      : `${body.slice(0, 140)}${body.length > 140 ? "..." : ""}`;
    button.append(titleLine, meta, snippet);
    button.addEventListener("click", () => {
      if (isSessionResult) {
        openSessionNote(result.index);
      } else {
        openFilteredNote(result.category, result.index);
      }
    });
    resultsContainer.append(button);
  });
}

function openFilteredNote(category, index) {
  activeNoteTab = category;
  activeNoteFilter = { category, index };
  if (state.notes[category][index].hidden) showHiddenNotes = true;
  state.notes[category][index].expanded = true;
  saveState();
  syncNoteTabs();
  renderNotes();
}

function openSessionNote(index) {
  const sessionNote = state.notes.sessions[index];
  if (!sessionNote) return;
  sessionNote.expanded = true;
  saveState();
  renderSessionNotes();
}

function clearNoteFilter() {
  activeNoteFilter = null;
  renderNotes();
}

function syncNoteFilterButton() {
  const button = $("#clearNoteFilter");
  if (!button) return;
  button.hidden = !activeNoteFilter;
}

function syncHiddenNotesButton() {
  const button = $("#toggleHiddenNotes");
  if (!button) return;
  const hiddenCount = state.notes[activeNoteTab].filter((note) => note.hidden).length;
  button.textContent = showHiddenNotes ? `Hide (${hiddenCount})` : `Show Hidden (${hiddenCount})`;
}

function toggleHiddenNotes() {
  showHiddenNotes = !showHiddenNotes;
  activeNoteFilter = null;
  renderNotes();
  renderNoteSearchResults();
}

function syncNoteTabs() {
  $$(".tab-button").forEach((tab) => tab.classList.toggle("active", tab.dataset.noteTab === activeNoteTab));
}

function setActiveCharacterTab(nextTab) {
  activeCharacterTab = nextTab;
  $$("[data-character-tab]").forEach((button) => {
    const isActive = button.dataset.characterTab === nextTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  $$("[data-character-tab-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.characterTabPanel !== nextTab;
  });
}

function sortNotesAlphabetically() {
  activeNoteFilter = null;
  state.notes[activeNoteTab].sort((a, b) => getSortTitle(a.title, "Untitled Knowledge").localeCompare(getSortTitle(b.title, "Untitled Knowledge")));
  saveState();
  renderNotes();
  renderNoteSearchResults();
}

function renderEmpty(container, message) {
  if (container.children.length) return;
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  container.append(empty);
}

function renderDynamicSections() {
  renderSkills();
  renderRageTypes();
  renderActions();
  renderAbilities();
  renderInventory();
  renderInventorySearchResults();
  renderStatuses();
  renderNotes();
  renderSessionNotes();
  renderNoteSearchResults();
  syncUndoButton();
  syncBackupButton();
  updateComputedValues();
  syncViewPanels();
}

function updateComputedValues() {
  const remaining = Math.max(0, Number(state.rage.total || 0) - Number(state.rage.used || 0));
  const currentHp = Number(state.character.hp || 0);
  const totalHp = Number(state.character.totalHp || 0);
  const hpRatio = totalHp > 0 ? Math.max(0, Math.min(currentHp / totalHp, 1)) : 1;
  const hpDanger = 1 - hpRatio;
  document.body.classList.toggle("raging", Boolean(state.rage.inRage));
  syncRageTheme();
  syncCharacterNameTitle();
  syncArmorClassShield();
  syncHeroicInspirationButton();
  updateRageButton(remaining);
  updateFighterButtons();
  updateRageTitles();
  const hpInput = $(".hp-main-input");
  if (hpInput) {
    hpInput.style.setProperty("--hp-danger", hpDanger.toFixed(3));
  }
}

function updateFighterButtons() {
  [
    ["#secondWindButton", "secondWindUsed", "secondWindTotal"],
    ["#actionSurgeButton", "actionSurgeUsed", "actionSurgeTotal"],
  ].forEach(([selector, usedKey, totalKey]) => {
    const button = $(selector);
    if (!button) return;
    button.disabled = state.fighter[totalKey] - state.fighter[usedKey] <= 0;
  });
}

function syncRageTheme() {
  document.body.classList.remove("rage-ferocity", "rage-monstrosity", "rage-reconstruction");
  if (state.rage.inRage && state.rage.activeType) {
    document.body.classList.add(`rage-${state.rage.activeType}`);
  }
}

function updateRageButton(remaining) {
  const button = $("#rageToggleButton");
  if (!button) return;
  const inRage = Boolean(state.rage.inRage);
  button.textContent = inRage
    ? "LEAVE RAGE"
    : state.rage.choosingType
      ? "CHOOSE A SERUM"
      : remaining > 0
        ? "GO INTO A RAGE"
        : "NO RAGES LEFT";
  button.disabled = !inRage && remaining <= 0;
  button.classList.toggle("is-active", inRage);
  button.classList.toggle("is-choosing", !inRage && Boolean(state.rage.choosingType));
}

function updateRageTitles() {
  const inRage = Boolean(state.rage.inRage);
  $$("[data-title]").forEach((panel) => {
    const heading = panel.querySelector(".panel-heading h2");
    if (!heading) return;
    heading.textContent = inRage ? panel.dataset.rageTitle || panel.dataset.title : panel.dataset.title;
  });
}

function syncViewPanels() {
  $$("[data-views]").forEach((panel) => {
    const views = panel.dataset.views.split(/\s+/);
    panel.hidden = !views.includes(activeView);
  });
}

function setActiveView(nextView) {
  activeView = nextView;
  document.body.classList.remove("view-sheet", "view-combat", "view-notes");
  document.body.classList.add(`view-${nextView}`);
  $$(".view-tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTab === nextView);
  });
  syncViewPanels();
}

function addEventHandlers() {
  const globalSearchInput = $("#globalSearchInput");
  globalSearchInput.addEventListener("input", () => {
    globalSearchQuery = globalSearchInput.value;
    renderGlobalSearchResults();
  });
  globalSearchInput.addEventListener("focus", renderGlobalSearchResults);
  globalSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGlobalSearch();
      globalSearchInput.blur();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      $(".global-search-result")?.focus();
    } else if (event.key === "Enter") {
      const firstResult = $(".global-search-result");
      if (firstResult) {
        event.preventDefault();
        firstResult.click();
      }
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest?.(".global-search")) closeGlobalSearch();
  });

  $("#characterNameDisplay").addEventListener("click", startCharacterNameEdit);
  $("#characterNameInput").addEventListener("blur", () => finishCharacterNameEdit());
  $("#characterNameInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finishCharacterNameEdit();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      finishCharacterNameEdit({ save: false });
    }
  });

  $("#acShieldButton").addEventListener("click", openArmorClassDialog);
  $("#heroicInspirationButton").addEventListener("click", () => {
    state.character.heroicInspiration = !state.character.heroicInspiration;
    saveState();
  });
  $("#acDialogForm").addEventListener("submit", saveArmorClass);
  $("#closeAcDialog").addEventListener("click", closeArmorClassDialog);
  $("#cancelAcDialog").addEventListener("click", closeArmorClassDialog);

  $("#proficiencyBonus").addEventListener("input", (event) => {
    state.character.proficiencyBonus = Number(event.target.value || 0);
    saveState();
    renderSkills();
  });

  $("#rageToggleButton").addEventListener("click", (event) => {
    toggleRageState();
    suppressRageTooltip(event.currentTarget);
  });

  $("#secondWindButton").addEventListener("click", () => useFighterFeature("secondWind"));
  $("#actionSurgeButton").addEventListener("click", () => useFighterFeature("actionSurge"));
  $("#shortRestButton").addEventListener("click", takeShortRest);
  $("#longRestButton").addEventListener("click", takeLongRest);
  $("#closeRestReminder").addEventListener("click", hideRestReminder);

  $("#addAction").addEventListener("click", () => {
    state.actions.push({ name: "", description: "", toHit: "", damage: "", expanded: true });
    saveState();
    renderActions();
  });

  $("#collapseActions").addEventListener("click", () => {
    state.actions.forEach((action) => {
      action.expanded = false;
    });
    saveState();
    renderActions();
  });
  $("#recklessToggle").addEventListener("click", toggleReckless);

  $("#addAbility").addEventListener("click", () => {
    state.abilities.push({ name: "", description: "", expanded: true, chargesTotal: 0, chargesUsed: 0 });
    saveState();
    renderAbilities();
  });

  $("#collapseAbilities").addEventListener("click", () => {
    state.abilities.forEach((ability) => {
      ability.expanded = false;
    });
    saveState();
    renderAbilities();
  });

  $("#addInventory").addEventListener("click", () => {
    activeInventoryFilter = null;
    state.inventory.push({ name: "", quantity: 1, notes: "", expanded: true, hidden: false });
    saveState();
    renderInventory();
  });

  $("#inventorySearchInput").addEventListener("input", (event) => {
    inventorySearchQuery = event.target.value;
    renderInventorySearchResults();
  });

  $("#clearInventoryFilter").addEventListener("click", clearInventoryFilter);
  $("#toggleHiddenInventory").addEventListener("click", toggleHiddenInventory);
  $("#sortInventory").addEventListener("click", sortInventoryAlphabetically);

  $("#addStatus").addEventListener("click", () => {
    state.statuses.push({ name: "", active: false, duration: "", notes: "" });
    saveState();
    renderStatuses();
  });

  $("#toggleInactiveStatuses").addEventListener("click", () => {
    showInactiveStatuses = !showInactiveStatuses;
    syncInactiveToggle();
    renderStatuses();
  });

  $("#addNote").addEventListener("click", () => {
    activeNoteFilter = null;
    state.notes[activeNoteTab].push({ title: "", body: "", expanded: true, hidden: false });
    saveState();
    renderNotes();
  });

  $("#addSessionNote").addEventListener("click", () => {
    state.notes.sessions.push({
      sessionNumber: state.notes.sessions.length + 1,
      date: "",
      body: "",
      expanded: true,
    });
    sortSessionNotesByDate();
    saveState();
    renderSessionNotes();
  });

  $("#toggleSessionNotesCollapse").addEventListener("click", () => {
    const shouldCollapse = state.notes.sessions.some((note) => note.expanded !== false);
    state.notes.sessions.forEach((sessionNote) => {
      sessionNote.expanded = !shouldCollapse;
    });
    saveState();
    renderSessionNotes();
  });

  $("#collapseNotes").addEventListener("click", () => {
    state.notes[activeNoteTab].forEach((note) => {
      note.expanded = false;
    });
    saveState();
    renderNotes();
  });

  $("#noteSearchInput").addEventListener("input", (event) => {
    noteSearchQuery = event.target.value;
    renderNoteSearchResults();
  });

  $("#clearNoteFilter").addEventListener("click", clearNoteFilter);
  $("#toggleHiddenNotes").addEventListener("click", toggleHiddenNotes);
  $("#sortNotes").addEventListener("click", sortNotesAlphabetically);

  $$("[data-hp-adjust]").forEach((button) => {
    button.addEventListener("click", () => {
      adjustCharacterHp(Number(button.dataset.hpAdjust || 0));
    });
  });

  $$("[data-character-tab]").forEach((button) => {
    button.addEventListener("click", () => setActiveCharacterTab(button.dataset.characterTab));
  });

  $$(".view-tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      closeGlobalSearch();
      setActiveView(button.dataset.viewTab);
    });
  });

  $$(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeNoteTab = button.dataset.noteTab;
      activeNoteFilter = null;
      syncNoteTabs();
      renderNotes();
    });
  });

  $("#undoDelete").addEventListener("click", undoLastDelete);
  $("#restoreBackup").addEventListener("click", restoreBackup);
  $("#exportData").addEventListener("click", exportData);
  $("#importData").addEventListener("change", importData);
  $("#resetData").addEventListener("click", resetData);
}

function downloadExport(json, filename) {
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportData() {
  storeVersionedBackup("export");
  const characterName = state.character.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "barbarian";
  const timestamp = formatCompactTimestamp();
  const filename = `${characterName}-sheet-${timestamp}.json`;
  const json = JSON.stringify(state, null, 2);

  if (!("showDirectoryPicker" in window)) {
    alert("This browser cannot write directly to the Saves folder. The export will use your Downloads folder instead.");
    downloadExport(json, filename);
    return;
  }

  try {
    const selectedDirectory = await window.showDirectoryPicker({
      id: "odyn-character-saves",
      mode: "readwrite",
      startIn: "documents",
    });
    let savesDirectory = selectedDirectory;
    if (selectedDirectory.name.toLowerCase() !== "saves") {
      try {
        savesDirectory = await selectedDirectory.getDirectoryHandle("Saves");
      } catch (error) {
        if (error.name === "NotFoundError") {
          alert("Choose either the Odyn Webapp folder or its Saves folder.");
          return;
        }
        throw error;
      }
    }
    const fileHandle = await savesDirectory.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(json);
    await writable.close();

    const exportButton = $("#exportData");
    exportButton.textContent = "Saved";
    window.setTimeout(() => {
      exportButton.textContent = "Export to Saves";
    }, 1600);
  } catch (error) {
    if (error.name === "AbortError") return;
    console.error("Could not export to Saves", error);
    alert("The export could not be written to the Saves folder.");
  }
}

function importData(event) {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      storeVersionedBackup("pre-import");
      applyLoadedState(JSON.parse(reader.result));
      storeVersionedBackup("import");
    } catch {
      alert("That file did not look like a valid character sheet export.");
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function resetData() {
  if (!confirm("Reset this sheet to the starter version?")) return;
  storeVersionedBackup("pre-reset");
  applyLoadedState(defaultState);
  storeVersionedBackup("reset");
}

bindPathInputs();
addEventHandlers();
renderDynamicSections();
setActiveView(activeView);
setActiveCharacterTab(activeCharacterTab);

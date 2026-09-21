// Карта двора
const MAP_DATA = {
  "0,0": { desc: "Ты у главного входа школы...", items: [], enemy: null, type: "entrance" },
  "1,0": { desc: "Центральная часть двора...", items: ["камень"], enemy: "камера", type: "center" },
  // ... все остальные комнаты
};

// Начальное состояние
const INITIAL_STATE = {
  x: 0, y: 0,
  inventory: [],
  noiseLevel: 0,
  isAlive: true,
  hasWon: false,
  distractedDog: false
};

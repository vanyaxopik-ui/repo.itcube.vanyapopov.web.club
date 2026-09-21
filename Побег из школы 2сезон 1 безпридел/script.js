const logEl = document.getElementById('log');
const inputEl = document.getElementById('cmd-input');
const noiseVal = document.getElementById('noise-val');
const stealthVal = document.getElementById('stealth-val');

// Состояние игрока
let player = {
  x: 0, y: 0,
  inventory: [],
  noiseLevel: 0,       // 0-100. Если > 80 - заметят
  isAlive: true,
  hasWon: false,
  distractedDog: false // Отвлек ли собаку
};

// Карта двора (ключ: "x,y")
const rooms = {
  "0,0": { desc: "Ты у главного входа школы. Ветер гоняет листья. Впереди — школьный двор.", items: [], enemy: null, type: "entrance" },
  "1,0": { desc: "Центральная часть двора. Здесь стоит старая статуя. Видна камера на столбе.", items: ["камень"], enemy: "камера", type: "center" },
  "2,0": { desc: "У забора. В ржавом металле видна дыра, но она слишком узкая. Рядом колючая проволока.", items: [], enemy: null, type: "fence" },
  "-1,0": { desc: "Спортивная площадка. Старые турники скрипят на ветру. Тихо.", items: ["связка ключей"], enemy: null, type: "sport" },
  "0,-1": { desc: "Угол двора. За кустами можно спрятаться. Слышно рычание.", items: [], enemy: "собака", type: "corner" },
  "0,1": { desc: "Хозяйственный сарай. Дверь приоткрыта, пахнет краской. Рядом ведро.", items: ["ведро"], enemy: null, type: "shed" },
  "1,-1": { desc: "Калитка. На ней висит тяжелый замок. Пройти нельзя.", items: [], enemy: "замок", type: "gate" }
};

function log(msg, isAlert = false, isSuccess = false) {
  const div = document.createElement('div');
  div.textContent = msg;
  if (isAlert) div.className = 'alert';
  if (isSuccess) div.className = 'success';
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function updateUI() {
  noiseVal.textContent = player.noiseLevel;
  if (player.noiseLevel < 30) stealthVal.textContent = "Идеально";
  else if (player.noiseLevel < 60) stealthVal.textContent = "Опасно";
  else stealthVal.textContent = "КРИТИЧНО!";
}

function getCurrentRoom() {
  return rooms[`${player.x},${player.y}`] || { desc: "Ты за пределами карты...", items: [], enemy: null };
}

function describeRoom() {
  const r = getCurrentRoom();
  log(`\n📍 [${r.type.toUpperCase()}] ${r.desc}`);
  if (r.items.length > 0) log(`🎒 Ты видишь: ${r.items.join(", ")}`);
  if (r.enemy) {
    if (r.enemy === "камера") log("🎥 Камера медленно поворачивается в твою сторону...");
    else if (r.enemy === "собака") log("🐕 Огромная сторожевая собака рычит неподалеку!");
    else log(`⚠️ Препятствие: ${r.enemy}`);
  }
}

function move(dir) {
  if (!player.isAlive || player.hasWon) return;

  const dx = dir === 'east' ? 1 : dir === 'west' ? -1 : 0;
  const dy = dir === 'north' ? 1 : dir === 'south' ? -1 : 0;
  
  const nextX = player.x + dx;
  const nextY = player.y + dy;
  const key = `${nextX},${nextY}`;

  if (!rooms[key]) {
    log("Туда нельзя пройти — там глухой забор.");
    return;
  }

  const nextRoom = rooms[key];
  
  // Проверка на собаку
  if (key === "0,-1" && !player.distractedDog) {
     log("Собака услышала шаги! 'ГАВ-ГАВ!'");
     player.noiseLevel += 40;
     updateUI();
     if (player.noiseLevel >= 80) {
       gameOver("Сторож услышал лай и поймал тебя. Конец побега.");
     }
     return;
  }

  // Проверка на камеру
  if (key === "1,0") {
    const detected = Math.random() > 0.7; // 30% шанс, что заметит
    if (detected) {
      log("🚨 Камера засекла движение! Красный свет мигает!");
      player.noiseLevel += 30;
      updateUI();
      if (player.noiseLevel >= 80) {
        gameOver("Сигнализация сработала! Тебя поймали.");
      }
      return;
    } else {
      log("Ты проскочил, пока камера смотрела в другую сторону.");
    }
  }

  player.x = nextX;
  player.y = nextY;
  describeRoom();
}

function runCommand() {
  if (!player.isAlive || player.hasWon) return;
  
  const cmd = inputEl.value.trim().toLowerCase();
  inputEl.value = "";
  const room = getCurrentRoom();

  // Взять предмет
  if (cmd.startsWith("взять ")) {
    const itemName = cmd.replace("взять", "").trim();
    if (room.items.includes(itemName)) {
      room.items = room.items.filter(i => i !== itemName);
      player.inventory.push(itemName);
      log(`✅ Ты взял: ${itemName}`);
    } else {
      log("Такого предмета здесь нет.");
    }
    return;
  }

  // Инвентарь
  if (cmd === "инвентарь" || cmd === "вещи") {
    log("🎒 Твой инвентарь: " + (player.inventory.length ? player.inventory.join(", ") : "пусто"));
    return;
  }

  // Осмотреться
  if (cmd === "осмотреться" || cmd === "осмотреть") {
    describeRoom();
    return;
  }

  // Отвлечь собаку
  if (cmd === "бросить камень" && player.inventory.includes("камень") && room.enemy === "собака") {
    log("Ты бросил камень в дальний угол. Собака побежала за ним! 🐕💨");
    player.inventory = player.inventory.filter(i => i !== "камень");
    player.distractedDog = true;
    return;
  }

  // Открыть калитку
  if ((cmd === "открыть калитку" || cmd === "выйти") && player.x === 1 && player.y === -1) {
    if (player.inventory.includes("связка ключей")) {
      log("🎉 Ты открыл замок! Свобода!");
      log("☀️ Ты выбежал со двора. Школа осталась позади. Победа!", false, true);
      player.hasWon = true;
    } else {
      log("Замок слишком сложный. Нужен ключ.");
    }
    return;
  }

  // Пролезть в дыру
  if (cmd === "пролезть в дыру" && player.x === 2 && player.y === 0) {
    log("Ты с трудом пролез через дыру в заборе... Царапины на руках, но ты на свободе!");
    log("🎉 Свобода! Ты сбежал!", false, true);
    player.hasWon = true;
    return;
  }

  log("Неизвестная команда. Попробуй: взять [предмет], бросить камень, открыть калитку, пролезть в дыру, инвентарь.");
}

function gameOver(reason) {
  player.isAlive = false;
  log(reason, true);
  log("Нажмите F5, чтобы начать заново.");
}

// Старт игры
log("🎮 Добро пожаловать в 'Побег во двор школы'. Твоя задача: выбраться со двора, избегая камер и собаки.");
describeRoom();

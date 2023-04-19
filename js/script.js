const guessInput = document.getElementById("guessInput");
const fireButton = document.getElementById("fireButton");
const boardGame = document.querySelector(".board-game");
const guessClick = document.querySelectorAll("td");

const view = {
  displayMessage: function (msg) {
    const messageArea = document.querySelector("#messageArea");
    messageArea.innerHTML = msg;
  },

  displayHit: function (location) {
    const cell = document.getElementById(location);
    cell.classList.add("hit");
  },

  displayMiss: function (location) {
    const cell = document.getElementById(location);
    cell.classList.add("miss");
  },
};

const model = {
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipsSunk: 0,

  ships: [
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
  ],

  fire: function (guess) {
    for (let i = 0; i < this.numShips; i++) {
      const ship = this.ships[i];
      const index = ship.locations.indexOf(guess);

      if (ship.hits[index] === "hit") {
        view.displayMessage("Ти вже стріляв по цій локації!");
        return true;
      } else if (index >= 0) {
        ship.hits[index] = "hit";
        view.displayHit(guess);
        view.displayMessage("Пряме влучення!");

        if (this.isSunk(ship)) {
          view.displayMessage("Ти відправив корабель до самого Нептуна!");
          this.shipsSunk++;
        }
        return true;
      }
    }
    view.displayMiss(guess);
    view.displayMessage("Не влучив!");
    return false;
  },

  isSunk: function (ship) {
    for (let i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") {
        return false;
      }
    }
    return true;
  },

  generateShipLocations: function () {
    var locations;
    for (let i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      this.ships[i].locations = locations;
    }
  },

  generateShip: function () {
    var direction = Math.floor(Math.random() * 2);
    var row, col;

    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
      col = Math.floor(Math.random() * this.boardSize);
    }

    var newShipLocations = [];
    for (let i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i));
      } else {
        newShipLocations.push(row + i + "" + col);
      }
    }
    return newShipLocations;
  },

  collision: function (locations) {
    for (let i = 0; i < this.numShips; i++) {
      const ship = this.ships[i];
      for (let j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  },
};

const controller = {
  gusses: 0,

  processGuess: function (location) {
    if (location) {
      this.gusses++;
      const hit = model.fire(location);
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage(
          "Вы потопили всі кораблі за: " + this.gusses + " пострілів"
        );
        guessClick.forEach((btn) => {
          btn.style.pointerEvents = "none";
          btn.style.opacity = "0.2";
          const btnStyle = btn.childNodes[0];

          if (
            btnStyle.classList.contains("hit") ||
            btnStyle.classList.contains("miss")
          ) {
            btn.style.opacity = "1";
          }
        });
      }
    }
  },

  addGuessInput: function (guess) {
    const location = parseGuess(guess);
    this.processGuess(location);
  },

  addGuessTouch: function (location) {
    this.processGuess(location);
  },
};

function parseGuess(guess) {
  const alphabet = ["A", "B", "C", "D", "E", "F", "G"];

  if (guess === null || guess.length !== 2) {
    alert("Вы ввели невірні координаты");
  } else {
    firstChar = guess.charAt(0);
    const row = alphabet.indexOf(firstChar.toUpperCase());
    const column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("Ви ввели невірні координати");
    } else if (
      row < 0 ||
      row >= model.boardSize ||
      column < 0 ||
      column >= model.boardSize
    ) {
      alert("Ви ввели невірні координати");
    } else {
      return row + column;
    }
  }
  return null;
}

fireButton.addEventListener("click", () => {
  const guess = guessInput.value;
  controller.addGuessInput(guess);
  guessInput.value = "";
});

guessInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    fireButton.click();
    return false;
  }
});

boardGame.addEventListener("click", (event) => {
  guessClick.forEach((btn) => {
    if (btn.childNodes[0] == event.target) {
      const guess = event.target.id;
      controller.addGuessTouch(guess);
    }
  });
});

model.generateShipLocations();
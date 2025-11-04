const canvas = document.querySelector(".seesaw-canvas");
const plank = document.querySelector(".seesaw-plank");
const pivot = document.querySelector(".seesaw-pivot");
const resetButton = document.querySelector(".seesaw-reset-button");

const leftWeightInfo = document.querySelector(
  ".left-weight-info-card .info-card-content"
);
const rightWeightInfo = document.querySelector(
  ".right-weight-info-card .info-card-content"
);
const nextWeightInfo = document.querySelector(
  ".next-weight-info-card .info-card-content"
);
const tiltAngleInfo = document.querySelector(
  ".tilt-angle-info-card .info-card-content"
);

const logsList = document.querySelector(".seesaw-logs-list");

let logs = [];
let weights = [
  {
    weight: 5,
    position: -100,
    placed: false,
    direction: "left",
  },
  {
    weight: 10,
    position: 100,
    placed: false,
    direction: "right",
  },
];

let leftWeight = 0;
let rightWeight = 0;
let nextWeight = 0;
let tiltAngle = 0;

const updateInfoCards = () => {
  leftWeightInfo.textContent = `${leftWeight.toFixed(1)} kg`;
  rightWeightInfo.textContent = `${rightWeight.toFixed(1)} kg`;
  nextWeightInfo.textContent = `${nextWeight.toFixed(1)} kg`;
  tiltAngleInfo.textContent = `${tiltAngle.toFixed(1)}°`;
};

const addWeight = (weight, direction, position) => {
  direction === "left" ? (leftWeight += weight) : (rightWeight += weight);

  const newLog = {
    timestamp: new Date().toLocaleTimeString(),
    weight: weight,
    position: position,
    direction: direction,
  };

  logs.unshift(newLog);
  appendLog(newLog);
  updateInfoCards();
};

const appendLog = (log) => {
  const logItem = document.createElement("div");
  logItem.classList.add("seesaw-log", "enter");
  logItem.innerHTML = `
    <div class="seesaw-log-info">
      <div class="log-weigth">
        <p>${log.weight}</p>
      </div>
      <p class="log-text">
        kg dropped on the <span>${log.direction}</span> side
      </p>
    </div>
    <div class="seesaw-log-time">
      <p>${log.timestamp}</p>
    </div>
  `;

  const delay = logs.indexOf(log) * 60;
  logItem.style.animationDelay = `${delay}ms`;

  logsList.prepend(logItem);

  logItem.addEventListener("animationend", () => {
    logItem.classList.remove("enter");
    logItem.style.animationDelay = "";
  });
};

const testAddWeights = () => {
  const testSequence = [
    { weight: 10, direction: "left", position: -100 },
    { weight: 15, direction: "right", position: 100 },
    { weight: 5, direction: "left", position: -80 },
    { weight: 20, direction: "right", position: 90 },
    { weight: 8, direction: "left", position: -120 },
  ];

  testSequence.forEach((item, i) => {
    setTimeout(() => {
      addWeight(item.weight, item.direction, item.position);
    }, i * 2000);
  });
};

window.addEventListener("DOMContentLoaded", () => {
  testAddWeights();
});

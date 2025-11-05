const canvas = document.querySelector(".seesaw-canvas");
const plank = document.querySelector(".seesaw-plank");
const plankClickArea = document.querySelector(".plank-clickable-area");
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
const boxList = document.querySelector(".box-list");

let logs = [];
let weights = [];

const WEIGHT_COLORS = {
  1: "#B2EBF2",
  2: "#4DD0E1",
  3: "#00ACC1",
  4: "#0097A7",
  5: "#00838F",
  6: "#006064",
  7: "#D32F2F",
  8: "#C62828",
  9: "#B71C1C",
  10: "#8B0000",
};

const CONFIG = {
  plankHeight: 20,
  maxAngle: 30,
  baseBoxSize: 45,
  maxTorque: 250,
  minWeight: 1,
  maxWeight: 10,
  maxPosition: 90,
};

let leftWeight = 0;
let rightWeight = 0;
let nextWeight = 0;
let tiltAngle = 0;

let displayedTilt = 0;
let tiltAnimId = null;

const updateInfoCards = () => {
  if (leftWeightInfo)
    leftWeightInfo.textContent = `${leftWeight.toFixed(1)} kg`;
  if (rightWeightInfo)
    rightWeightInfo.textContent = `${rightWeight.toFixed(1)} kg`;
  if (nextWeightInfo)
    nextWeightInfo.textContent = `${nextWeight.toFixed(1)} kg`;
  animateTiltDisplay(displayedTilt, tiltAngle);
};

const easeInCubic = (t) => t * t * t;

const animateTiltDisplay = (from, to, duration = 400) => {
  if (tiltAnimId) cancelAnimationFrame(tiltAnimId);
  const start = performance.now();
  const delta = to - from;

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInCubic(progress);
    const value = from + delta * eased;
    if (tiltAngleInfo) tiltAngleInfo.textContent = `${value.toFixed(1)}°`;

    if (progress < 1) {
      tiltAnimId = requestAnimationFrame(step);
    } else {
      tiltAnimId = null;
      displayedTilt = to;
      if (tiltAngleInfo) {
        tiltAngleInfo.classList.remove("tilt-animate");
        void tiltAngleInfo.offsetWidth;
        tiltAngleInfo.classList.add("tilt-animate");
      }
    }
  };

  tiltAnimId = requestAnimationFrame(step);
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

  const weightBox = createWeightBox(weight, position);
  boxList.appendChild(weightBox);

  updateSeesaw();
};

const createWeightBox = (weight, position) => {
  const box = document.createElement("div");
  box.classList.add("weight-box");

  const boxType =
    Array.from(boxTypeInputs).find((input) => input.checked)?.value ||
    "rectangle";
  box.classList.add(boxType);
  const maxWeight = 10;
  const scale = Math.max(0.4, Math.min(3, 0.5 + weight / maxWeight));
  const size = CONFIG.baseBoxSize * scale;

  updateBoxStyle(box, weight, size, boxType);

  let percentFromCenter = (position / 100) * 50;
  let centerPercent = 50 + percentFromCenter;

  const plankWidth = plank.offsetWidth || 1;
  const halfBoxPercent = (size / 2 / plankWidth) * 100;
  const minPercent = halfBoxPercent;
  const maxPercent = 100 - halfBoxPercent;
  centerPercent = Math.max(minPercent, Math.min(maxPercent, centerPercent));

  box.style.left = `${centerPercent}%`;
  box.style.transform = `translateX(-50%)`;

  return box;
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
        kg dropped on the <span>${log.direction}</span> side at 
        <span>${Math.abs(log.position.toFixed(2))}</span> units from pivot
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

const calculateTiltAngle = () => {
  const leftTorque = logs
    .filter((log) => log.direction === "left")
    .reduce((total, log) => total + log.weight * Math.abs(log.position), 0);

  const rightTorque = logs
    .filter((log) => log.direction === "right")
    .reduce((total, log) => total + log.weight * Math.abs(log.position), 0);

  const netTorque = rightTorque - leftTorque;

  const maxTorque = CONFIG.maxTorque;
  const maxAngle = CONFIG.maxAngle;

  tiltAngle = (netTorque / maxTorque) * maxAngle;

  return Math.max(Math.min(tiltAngle, maxAngle), -maxAngle);
};

const updateSeesaw = () => {
  tiltAngle = calculateTiltAngle();
  plank.style.transform = `translate(-50%, 50%) rotate(${tiltAngle}deg)`;
};

const resetSeesaw = () => {
  leftWeight = 0;
  rightWeight = 0;
  tiltAngle = 0;
  logs = [];
  logsList.innerHTML = "";
  boxList.innerHTML = "";

  if (previewBox) {
    if (previewBox.parentNode) previewBox.parentNode.removeChild(previewBox);
    previewBox = null;
  }
  updateSeesaw();
  updateInfoCards();
};

resetButton.addEventListener("click", resetSeesaw);

const getRandomWeight = () => {
  return (
    Math.floor(Math.random() * (CONFIG.maxWeight - CONFIG.minWeight + 1)) +
    CONFIG.minWeight
  );
};

const calculateClickPosition = (event) => {
  const plankRect = plank.getBoundingClientRect();
  const plankCenter = plankRect.left + plankRect.width / 2;
  const clickX = event.clientX;
  const distanceFromCenter = clickX - plankCenter;
  const position =
    (distanceFromCenter / (plankRect.width / 2)) * CONFIG.maxPosition;
  const direction = position < 0 ? "left" : "right";
  return { position, direction };
};

let previewBox = null;
let lastHoverPosition = 0;

const createOrUpdatePreview = (weight, position) => {
  const pos = Math.max(
    -CONFIG.maxPosition,
    Math.min(CONFIG.maxPosition, position || 0)
  );
  lastHoverPosition = pos;

  const boxType =
    Array.from(boxTypeInputs).find((i) => i.checked)?.value || "rectangle";

  const scale = Math.max(0.4, Math.min(3, 0.5 + weight / CONFIG.maxWeight));
  const size = CONFIG.baseBoxSize * scale;

  if (!previewBox) {
    previewBox = document.createElement("div");
    previewBox.classList.add("weight-box", "preview");
    boxList.appendChild(previewBox);
  } else {
    previewBox.classList.remove("rectangle", "circle");
  }

  updateBoxStyle(previewBox, weight, size, boxType);

  const plankRect = plank.getBoundingClientRect();
  const plankWidth = plankRect.width || 1;
  const halfPlank = plankWidth / 2;

  const pixelPosition = (pos / CONFIG.maxPosition) * halfPlank;

  previewBox.style.left = `50%`;
  previewBox.style.transform = `translateX(calc(-50% + ${pixelPosition}px))`;
};

const updateBoxStyle = (box, weight, size, boxType) => {
  const boxColor = WEIGHT_COLORS[weight];
  box.classList.add(boxType);
  box.style.bottom = `${CONFIG.plankHeight}px`;
  box.textContent = `${weight}kg`;
  box.style.width = `${size}px`;
  box.style.height = `${size}px`;
  box.style.backgroundColor = boxColor;
};

const hidePreview = () => {
  if (previewBox) previewBox.style.display = "none";
};

const showPreview = () => {
  if (previewBox) previewBox.style.display = "";
};

plankClickArea.addEventListener("mousemove", (e) => {
  const { position } = calculateClickPosition(e);
  createOrUpdatePreview(nextWeight, position);
  showPreview();
});

plankClickArea.addEventListener("mouseleave", () => {
  hidePreview();
});

const refreshPreviewForNext = () => {
  if (!previewBox) return;
  createOrUpdatePreview(nextWeight, lastHoverPosition);
};

plankClickArea.addEventListener("click", (event) => {
  const { position, direction } = calculateClickPosition(event);
  addWeight(nextWeight, direction, position);
  nextWeight = getRandomWeight();
  updateInfoCards();
  refreshPreviewForNext();
});

window.addEventListener("DOMContentLoaded", () => {
  nextWeight = getRandomWeight();
  updateInfoCards();
  createOrUpdatePreview(nextWeight, 0);
  hidePreview();
});
const settingsToggle = document.querySelector(".seesaw-settings-toggle-button");
const settingsContainer = document.querySelector(".seesaw-settings-container");

if (settingsToggle && settingsContainer) {
  settingsToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsContainer.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (
      !settingsContainer.contains(e.target) &&
      !settingsToggle.contains(e.target)
    ) {
      settingsContainer.classList.remove("open");
    }
  });
}

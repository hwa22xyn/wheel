// DOM Elements
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const addOptionBtn = document.getElementById("add-option");
const resetOptionsBtn = document.getElementById("reset-options");
const optionsContainer = document.getElementById("options-container");
const resultBox = document.getElementById("result-box");

// Variables
let options = ["Option 1"];
let startAngle = 0;
let arc = Math.PI / (options.length / 2);
let spinAngle = 0;
let spinTimeout = null;
let spinning = false;
const colors = ["#ff0099", "#00ffcc", "#ffcc00", "#ff6600", "#0099ff"]; // Neon colors

// Draw the wheel
function drawWheel() {
  const outsideRadius = 200;
  const textRadius = 160;
  const insideRadius = 50;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  ctx.textBaseline = "middle";

  for (let i = 0; i < options.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = colors[i % colors.length]; // Cycle through 5 neon colors

    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      outsideRadius,
      angle,
      angle + arc,
      false
    );
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      insideRadius,
      angle + arc,
      angle,
      true
    );
    ctx.stroke();
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Comic Sans MS"; // Fun font
    ctx.translate(
      canvas.width / 2 + Math.cos(angle + arc / 2) * textRadius,
      canvas.height / 2 + Math.sin(angle + arc / 2) * textRadius
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2); // Rotate text towards the center
    ctx.fillText(options[i], -ctx.measureText(options[i]).width / 2, 0);
    ctx.restore();
  }
}

// Sync the input boxes with the options
function updateOptions() {
  const inputs = document.querySelectorAll(".option-input");
  options = Array.from(inputs).map((input) => input.value);
  arc = Math.PI / (options.length / 2);
  drawWheel();
}

// Spin logic
function rotateWheel() {
  startAngle += spinAngle * (Math.PI / 180); // Update the wheel's rotation
  drawWheel();
  spinAngle *= 0.97; // Gradually slow down the spin

  if (spinAngle < 0.1) {
    clearTimeout(spinTimeout);
    spinAngle = 0;
    showResult();
  } else {
    spinTimeout = setTimeout(rotateWheel, 30);
  }
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinAngle = Math.random() * 3000 + 2000;
  setTimeout(() => {
    spinning = false;
  }, 3000);
  rotateWheel();
}

// Show the result in the result box
function showResult() {
  const totalDegrees = (startAngle * (180 / Math.PI)) % 360;
  const normalizedDegrees = (360 - totalDegrees + 270) % 360;
  const degreesPerOption = 360 / options.length;
  const winningIndex = Math.floor(normalizedDegrees / degreesPerOption) % options.length;

  const result = options[winningIndex];

  resultBox.innerText = `The One: ${result}`;
}

// Add a new option
function addOption() {
  const optionContainer = document.createElement("div");
  optionContainer.classList.add("option-container");

  const newOption = document.createElement("input");
  newOption.classList.add("option-input");
  newOption.placeholder = `Option ${options.length + 1}`;
  newOption.value = `Option ${options.length + 1}`;
  newOption.addEventListener("input", updateOptions);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = "✖";
  deleteBtn.addEventListener("click", () => {
    optionContainer.remove();
    updateOptions();
  });

  optionContainer.appendChild(newOption);
  optionContainer.appendChild(deleteBtn);
  optionsContainer.appendChild(optionContainer);
  updateOptions();
}


// Reset all options
function resetOptions() {
  options = ["Option 1"];
  optionsContainer.innerHTML = "";
  addOption(); // Re-add the first option
}

// Event Listeners
spinButton.addEventListener("click", spin);
addOptionBtn.addEventListener("click", addOption);
resetOptionsBtn.addEventListener("click", resetOptions);

addOption(); // Initialize the first option
drawWheel();

// Test if the result box updates
document.getElementById("spinButton").addEventListener("click", () => {
  resultBox.innerText = "Spinning...";
  setTimeout(() => {
    console.log("Spin complete!");
  }, 3000);
});
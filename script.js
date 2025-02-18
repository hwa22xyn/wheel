// Get references to DOM elements
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const resetOptionsBtn = document.getElementById("reset-options");
const textarea = document.getElementById("options-textarea");
const resultBox = document.getElementById("result-box");

// Default options and colors
let options = ["Option 1"];
let colors = ["#FF0000", "#FF9900", "#FFFF00", "#00CC00", "#0066FF", "#9900CC"];

let arc = Math.PI / (options.length / 2);
let startAngle = 0;
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;
let isSpinning = false;

// Initialize favoriteTemplates from localStorage
let favoriteTemplates = JSON.parse(localStorage.getItem("favoriteTemplates")) || [];

// Load counter values from localStorage
let totalSpins = parseInt(localStorage.getItem("totalSpins")) || 0;
let totalHours = parseFloat(localStorage.getItem("totalHours")) || 0;

// Function to update the displayed counter
function updateCounterDisplay() {
  document.getElementById("spin-count").innerText = totalSpins.toLocaleString();
  document.getElementById("spin-hours").innerText = totalHours.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Function to update counter values after a spin
function updateCounter() {
  totalSpins += 1;
  totalHours += (5 / 3600); // Assuming each spin takes ~5 seconds
  localStorage.setItem("totalSpins", totalSpins);
  localStorage.setItem("totalHours", totalHours);
  updateCounterDisplay();
}

// Function to wrap text dynamically based on segment width
function wrapText(ctx, text, maxWidth) {
  let lines = [];
  let line = "";

  for (let i = 0; i < text.length; i++) {
    line += text[i];
    const lineWidth = ctx.measureText(line).width;

    if (lineWidth > maxWidth) {
      lines.push(line.slice(0, -1));
      line = text[i];
    }

    if (i === text.length - 1) {
      lines.push(line);
    }
  }

  return lines;
}

// Function to draw the wheel
function drawWheel() {
  const outsideRadius = 300;
  const textRadius = 190;
  const insideRadius = 50;
  const lineHeight = 18;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.textBaseline = "middle";

  let shuffledColors = getShuffledColors(options.length);

  for (let i = 0; i < options.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = shuffledColors[i];

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + arc, false);
    ctx.arc(canvas.width / 2, canvas.height / 2, insideRadius, angle + arc, angle, true);
    ctx.stroke();
    ctx.fill();

    const maxWidth = Math.floor(arc * textRadius);
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial";
    ctx.translate(
      canvas.width / 2 + Math.cos(angle + arc / 2) * textRadius,
      canvas.height / 2 + Math.sin(angle + arc / 2) * textRadius
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2);

    const lines = wrapText(ctx, options[i], maxWidth);
    let yOffset = -(lines.length * lineHeight) / 2;

    for (let j = 0; j < lines.length; j++) {
      const lineWidth = ctx.measureText(lines[j]).width;
      const xOffset = -lineWidth / 2;
      ctx.fillText(lines[j], xOffset, yOffset + j * lineHeight);
    }

    ctx.restore();
  }
}

// Function to shuffle colors and ensure no adjacent duplicates
function getShuffledColors(numSegments) {
  let shuffledColors = [];
  let availableColors = [...colors];

  for (let i = 0; i < numSegments; i++) {
    if (i === 0) {
      shuffledColors.push(availableColors.splice(Math.floor(Math.random() * availableColors.length), 1)[0]);
    } else {
      let filteredColors = availableColors.filter(color => color !== shuffledColors[i - 1]);
      if (filteredColors.length === 0) {
        availableColors = [...colors].filter(color => color !== shuffledColors[i - 1]);
        filteredColors = availableColors;
      }
      let chosenColor = filteredColors.splice(Math.floor(Math.random() * filteredColors.length), 1)[0];
      shuffledColors.push(chosenColor);
      availableColors = availableColors.filter(color => color !== chosenColor);
    }
  }

  return shuffledColors;
}

// Function to spin the wheel
function rotateWheel() {
  if (isSpinning) return;

  resultBox.textContent = "Spinning...";
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 4000;
  isSpinning = true;
  rotateAnimation();
}

// Animation for spinning the wheel
function rotateAnimation() {
  spinTime += 30;

  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }

  const spinAngle = spinAngleStart - (spinTime / spinTimeTotal) * spinAngleStart;
  startAngle += (spinAngle * Math.PI) / 180;
  drawWheel();
  spinTimeout = setTimeout(rotateAnimation, 30);
}

// Stop the wheel and determine the result
function stopRotateWheel() {
  isSpinning = false;
  clearTimeout(spinTimeout);

  const degrees = (startAngle * 180) / Math.PI + 90;
  const index = Math.floor((360 - (degrees % 360)) / (360 / options.length));

  resultBox.textContent = `Result: ${options[index]}`;
  updateCounter();
}

// Function to update options from the textarea
function updateOptions() {
  options = textarea.value.trim().split("\n").filter(option => option.trim() !== "");
  if (options.length === 0) options = ["Option 1"];
  arc = Math.PI / (options.length / 2);
  drawWheel();
}

// Reset options
function resetOptions() {
  textarea.value = "";
  updateOptions();
}

// Function to update the dropdown with saved favorites
function updateDropdown() {
  const select = document.getElementById("templateSelect");
  select.innerHTML = ''; // Clear existing options

  // Add "Favorites..." as the first option
  let defaultOption = document.createElement("option");
  defaultOption.value = '';
  defaultOption.textContent = 'Favorites...';
  select.appendChild(defaultOption);

  // Add user-defined favorites to dropdown
  favoriteTemplates.forEach((template) => {
    let title = template.title;

    // Only add to dropdown if the title exists
    if (title) {
      let option = document.createElement("option");
      option.value = title;
      option.textContent = title;
      select.appendChild(option);
    }
  });
}

// Function to save the current wheel as a favorite template
function saveFavoriteTemplate() {
  const title = prompt("Enter a title for your favorite wheel:"); // Prompt the user for a title

  if (title) {
    // Check if a favorite with the same title already exists
    const existingFavorite = favoriteTemplates.find(fav => fav.title === title);

    if (existingFavorite) {
      alert("This title already exists. Please choose a different title.");
      return; // Prevent overwriting the existing favorite
    }

    const newFavorite = {
      title: title, // Use the title provided by the user
      options: [...options], // Copy current options
      colors: [...colors],   // Copy current colors
    };

    favoriteTemplates.push(newFavorite); // Add the new favorite to the list
    localStorage.setItem("favoriteTemplates", JSON.stringify(favoriteTemplates)); // Save to localStorage
    updateDropdown(); // Update the dropdown menu dynamically
    alert("Wheel saved as favorite!");
  } else {
    alert("Please provide a valid title for the favorite.");
  }
}

// Function to reset the options and title
function resetOptions() {
  textarea.value = ""; // Clear the options textarea
  options = ["Option 1"]; // Reset the options to the default
  colors = ["#FF0000", "#FF9900", "#FFFF00", "#00CC00", "#0066FF", "#9900CC"]; // Reset colors
  arc = Math.PI / (options.length / 2); // Reset arc calculation
  drawWheel(); // Redraw the wheel
  document.getElementById("templateSelect").value = ''; // Reset the dropdown selection
}

// Initial load of favorites from localStorage
document.addEventListener("DOMContentLoaded", () => {
  // Load saved favorites from localStorage
  const savedFavorites = localStorage.getItem("favoriteTemplates");
  if (savedFavorites) {
    favoriteTemplates = JSON.parse(savedFavorites);
  }
  updateDropdown(); // Ensure the dropdown is updated
});

// Function to load a selected favorite template
function loadFavoriteTemplate() {
  const selectedValue = document.getElementById("templateSelect").value;

  // Find the favorite based on the title
  const selectedFavorite = favoriteTemplates.find(fav => fav.title === selectedValue);
  
  if (selectedFavorite) {
    options = selectedFavorite.options;
    colors = selectedFavorite.colors;
    arc = Math.PI / (options.length / 2);
    drawWheel();
  } else {
    alert("No favorite saved yet!");
  }
}

// Attach event listeners
spinButton.addEventListener("click", rotateWheel);
resetOptionsBtn.addEventListener("click", resetOptions);
textarea.addEventListener("input", updateOptions);
document.getElementById("favorite-wheel").addEventListener("click", saveFavoriteTemplate);
document.getElementById("templateSelect").addEventListener("change", loadFavoriteTemplate);

// Initial setup
updateCounterDisplay();
updateDropdown();
drawWheel();

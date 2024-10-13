const arrayInput = document.getElementById('arrayInput');
const randomArrayBtn = document.getElementById('randomArrayBtn');
const startBtn = document.getElementById('startBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const arrayContainer = document.getElementById('arrayContainer');
const infoText = document.getElementById('infoText');

let array = [];
let currentStep = 0;
let intervalId = null;
let isRunning = false;
let speed = 3;

// Event listeners remain the same
randomArrayBtn.addEventListener('click', generateRandomArray);
startBtn.addEventListener('click', startVisualization);
stepBtn.addEventListener('click', stepVisualization);
resetBtn.addEventListener('click', resetVisualization);
speedControl.addEventListener('input', updateSpeed);

function generateRandomArray() {
    const size = Math.floor(Math.random() * 10) + 5; // 5 to 14 elements
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    arrayInput.value = array.join(',');
    visualizeArray();
}

function updateSpeed() {
    speed = speedControl.value;
    speedValue.textContent = speed;
}

function startVisualization() {
    if (isRunning) return;
    isRunning = true;
    array = arrayInput.value.split(',').map(Number);
    currentStep = 0;
    minMax();
}

function stepVisualization() {
    if (!isRunning) {
        startVisualization();
    } else {
        // If already running, allow stepping through
        if (currentStep < array.length) {
            minMaxStep(currentStep);
            currentStep++;
        }
    }
}

function resetVisualization() {
    isRunning = false;
    currentStep = 0;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    visualizeArray();
    infoText.textContent = '';
}

function visualizeArray(current = -1, min = -1, max = -1) {
    arrayContainer.innerHTML = ''; // Clear previous bars
    const maxVal = Math.max(...array);
    
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (value / maxVal) * 280; // Adjust based on your layout
        bar.style.height = `${height}px`;

        // Create a span for the bar value
        const valueLabel = document.createElement('span');
        valueLabel.className = 'bar-value';
        valueLabel.textContent = value;
        bar.appendChild(valueLabel); // Append value label to bar

        // Apply classes based on current, min, and max indices
        if (index === current) bar.classList.add('current');
        if (index === min) bar.classList.add('min');
        if (index === max) bar.classList.add('max');

        arrayContainer.appendChild(bar); // Append bar to container
    });
}

async function minMax() {
    let min = array[0];
    let max = array[0];
    let minIndex = 0;
    let maxIndex = 0;

    for (let i = 1; i < array.length; i++) {
        visualizeArray(i, minIndex, maxIndex);
        infoText.textContent = `Comparing ${array[i]} with current min (${min}) and max (${max})`;

        await new Promise(resolve => {
            intervalId = setTimeout(() => {
                if (array[i] < min) {
                    min = array[i];
                    minIndex = i;
                } else if (array[i] > max) {
                    max = array[i];
                    maxIndex = i;
                }
                resolve();
            }, 3000 - speed * 500); // Adjust speed
        });

        if (!isRunning) break;
    }

    if (isRunning) {
        visualizeArray(-1, minIndex, maxIndex);
        infoText.textContent = `Min: ${min} at index ${minIndex}, Max: ${max} at index ${maxIndex}`;
        isRunning = false;
    }
}

// Initialize with a random array
generateRandomArray();

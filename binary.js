const arrayInput = document.getElementById('arrayInput');
const randomArrayBtn = document.getElementById('randomArrayBtn');
const searchInput = document.getElementById('searchInput');
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

randomArrayBtn.addEventListener('click', generateRandomArray);
startBtn.addEventListener('click', startVisualization);
stepBtn.addEventListener('click', stepVisualization);
resetBtn.addEventListener('click', resetVisualization);
speedControl.addEventListener('input', updateSpeed);

function generateRandomArray() {
    const size = Math.floor(Math.random() * 10) + 5; // 5 to 14 elements
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    array.sort((a, b) => a - b); // Sort the array for binary search
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
    array.sort((a, b) => a - b); // Ensure the array is sorted
    currentStep = 0;
    const target = parseInt(searchInput.value);
    binarySearch(target);
}

function stepVisualization() {
    if (!isRunning) startVisualization();
    else if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
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

function visualizeArray(left = -1, right = -1, mid = -1, found = false) {
    arrayContainer.innerHTML = '';
    const maxVal = Math.max(...array);
    
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (value / maxVal) * 280;
        bar.style.height = `${height}px`;
        bar.textContent = value;

        if (index === mid) bar.classList.add(found ? 'found' : 'selected');
        if (index === left || index === right) bar.classList.add('comparing');

        arrayContainer.appendChild(bar);
    });
}

async function binarySearch(target) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        visualizeArray(left, right, mid);
        infoText.textContent = `Searching for ${target}. Current range: [${left}, ${right}], Middle: ${mid}`;

        await new Promise(resolve => {
            intervalId = setTimeout(() => {
                if (array[mid] === target) {
                    visualizeArray(left, right, mid, true);
                    infoText.textContent = `Found ${target} at index ${mid}`;
                    isRunning = false;
                    resolve();
                } else if (array[mid] < target) {
                    left = mid + 1;
                    resolve();
                } else {
                    right = mid - 1;
                    resolve();
                }
            }, 3000 - speed * 500); // Adjust speed
        });

        if (!isRunning) break;
    }

    if (isRunning) {
        infoText.textContent = `${target} not found in the array`;
        isRunning = false;
    }
}

// Initialize with a random array
generateRandomArray();
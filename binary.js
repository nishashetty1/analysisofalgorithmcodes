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
let animationId = null;
let isRunning = false;
let speed = 3;

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

randomArrayBtn.addEventListener('click', generateRandomArray);
startBtn.addEventListener('click', startVisualization);
stepBtn.addEventListener('click', stepVisualization);
resetBtn.addEventListener('click', resetVisualization);
speedControl.addEventListener('input', debounce(updateSpeed, 100));

function generateRandomArray() {
    const isMobile = window.innerWidth <= 600;
    const minSize = isMobile ? 3 : 5;
    const maxSize = isMobile ? 8 : 14;
    const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1).sort((a, b) => a - b);
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
    array = arrayInput.value.split(',').map(Number).sort((a, b) => a - b);
    currentStep = 0;
    const target = parseInt(searchInput.value);
    binarySearch(target);
}

function stepVisualization() {
    if (!isRunning) startVisualization();
    else if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function resetVisualization() {
    isRunning = false;
    currentStep = 0;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    visualizeArray();
    infoText.textContent = '';
}

function visualizeArray(left = null, right = null, mid = null, found = false) {
    const maxVal = Math.max(...array);
    const fragment = document.createDocumentFragment();

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';

        // Dynamically scale the height based on container size and max value
        const height = (value / maxVal) * 100;
        bar.style.height = `${height}%`;

        const valueLabel = document.createElement('span');
        valueLabel.className = 'bar-value';
        valueLabel.textContent = value;
        bar.appendChild(valueLabel);

        // Apply classes based on the current state
        if (found && index === mid) {
            bar.classList.add('found');
        } else if (index === mid) {
            bar.classList.add('selected');
        } else if (index >= left && index <= right) {
            bar.classList.add('comparing');
        }

        fragment.appendChild(bar);
    });

    arrayContainer.innerHTML = '';
    arrayContainer.appendChild(fragment);
}


async function binarySearch(target) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right && isRunning) {
        const mid = Math.floor((left + right) / 2);
        visualizeArray(left, right, mid);
        infoText.textContent = `Searching for ${target}. Current range: [${left}, ${right}], Middle: ${mid}`;

        await new Promise(resolve => {
            animationId = requestAnimationFrame(() => {
                setTimeout(() => {
                    if (array[mid] === target) {
                        visualizeArray(left, right, mid, true);
                        infoText.textContent = `Found ${target} at index ${mid}`;
                        isRunning = false;
                    } else if (array[mid] < target) {
                        left = mid + 1;
                    } else {
                        right = mid - 1;
                    }
                    resolve();
                }, 3000 - speed * 500);
            });
        });
    }

    if (isRunning) {
        infoText.textContent = `${target} not found in the array`;
        isRunning = false;
    }
}


// Initialize with a random array
generateRandomArray();
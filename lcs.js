const sequence1Input = document.getElementById('sequence1');
const sequence2Input = document.getElementById('sequence2');
const startBtn = document.getElementById('startBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const lcsMatrix = document.getElementById('lcsMatrix');
const infoText = document.getElementById('infoText');

let seq1 = '';
let seq2 = '';
let matrix = [];
let currentStep = { i: 0, j: 0 };
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

startBtn.addEventListener('click', startVisualization);
stepBtn.addEventListener('click', stepVisualization);
resetBtn.addEventListener('click', resetVisualization);
speedControl.addEventListener('input', debounce(updateSpeed, 100));

function updateSpeed() {
    speed = speedControl.value;
    speedValue.textContent = speed;
}

function startVisualization() {
    if (isRunning) return;
    isRunning = true;
    seq1 = sequence1Input.value;
    seq2 = sequence2Input.value;
    initializeMatrix();
    visualizeMatrix();
    currentStep = { i: 1, j: 1 };
    lcsStep();
}

function stepVisualization() {
    if (!isRunning) startVisualization();
    else if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        lcsStep();
    }
}

function resetVisualization() {
    isRunning = false;
    currentStep = { i: 0, j: 0 };
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    initializeMatrix();
    visualizeMatrix();
    infoText.textContent = '';
}

function initializeMatrix() {
    matrix = Array(seq1.length + 1).fill().map(() => Array(seq2.length + 1).fill(0));
}

function visualizeMatrix() {
    lcsMatrix.innerHTML = '';
    lcsMatrix.style.gridTemplateColumns = `repeat(${seq2.length + 1}, auto)`;

    // Add header row
    const headerRow = document.createElement('div');
    headerRow.className = 'cell';
    headerRow.textContent = '';
    lcsMatrix.appendChild(headerRow);

    for (let j = 0; j < seq2.length; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = seq2[j];
        lcsMatrix.appendChild(cell);
    }

    // Add matrix cells with row headers
    for (let i = 0; i <= seq1.length; i++) {
        const rowHeader = document.createElement('div');
        rowHeader.className = 'cell';
        rowHeader.textContent = i === 0 ? '' : seq1[i - 1];
        lcsMatrix.appendChild(rowHeader);

        for (let j = 0; j <= seq2.length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = matrix[i][j];
            if (i === currentStep.i && j === currentStep.j) {
                cell.classList.add('current');
            } else if (i < currentStep.i || (i === currentStep.i && j < currentStep.j)) {
                cell.classList.add('filled');
            }
            lcsMatrix.appendChild(cell);
        }
    }
}

function lcsStep() {
    if (currentStep.i <= seq1.length && currentStep.j <= seq2.length) {
        if (currentStep.i === 0 || currentStep.j === 0) {
            matrix[currentStep.i][currentStep.j] = 0;
        } else if (seq1[currentStep.i - 1] === seq2[currentStep.j - 1]) {
            matrix[currentStep.i][currentStep.j] = matrix[currentStep.i - 1][currentStep.j - 1] + 1;
            infoText.textContent = `Match found: ${seq1[currentStep.i - 1]}`;
        } else {
            matrix[currentStep.i][currentStep.j] = Math.max(
                matrix[currentStep.i - 1][currentStep.j],
                matrix[currentStep.i][currentStep.j - 1]
            );
            infoText.textContent = 'No match, taking maximum of left and top cells';
        }

        visualizeMatrix();

        currentStep.j++;
        if (currentStep.j > seq2.length) {
            currentStep.i++;
            currentStep.j = 0;
        }

        if (isRunning) {
            animationId = requestAnimationFrame(() => {
                setTimeout(lcsStep, 3000 - speed * 500);
            });
        }
    } else {
        isRunning = false;
        infoText.textContent = `LCS length: ${matrix[seq1.length][seq2.length]}`;
        traceLCS();
    }
}

function traceLCS() {
    let i = seq1.length;
    let j = seq2.length;
    let lcs = '';

    while (i > 0 && j > 0) {
        if (seq1[i - 1] === seq2[j - 1]) {
            lcs = seq1[i - 1] + lcs;
            i--;
            j--;
        } else if (matrix[i - 1][j] > matrix[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    infoText.textContent += ` LCS: ${lcs}`;
}

// Initialize with empty sequences
resetVisualization();
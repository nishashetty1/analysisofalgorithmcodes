import { selectionSort } from './selection.js';
import { bubbleSort } from './bubble.js';
import { insertionSort } from './insertion.js';
import { mergeSort } from './merge.js';
import { quickSort } from './quick.js';

const arrayInput = document.getElementById('arrayInput');
const randomArrayBtn = document.getElementById('randomArrayBtn');
const algorithmSelect = document.getElementById('algorithmSelect');
const startBtn = document.getElementById('startBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const compareBtn = document.getElementById('compareBtn');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');

let array1 = [], array2 = [];
let isSorting = false;
let isStepMode = false;
let currentStep = 0;
let speed = 3;
let compareMode = false;
let initialAlgorithm = '';

randomArrayBtn.addEventListener('click', generateRandomArray);
startBtn.addEventListener('click', startSorting);
stepBtn.addEventListener('click', handleStep);
resetBtn.addEventListener('click', resetVisualization);
compareBtn.addEventListener('click', toggleCompareMode);
speedControl.addEventListener('input', updateSpeed);

function generateRandomArray() {
    const size = Math.floor(Math.random() * 10) + 5; // 5 to 14 elements
    const randomArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    arrayInput.value = randomArray.join(',');
    resetVisualization();
}

function updateSpeed() {
    speed = speedControl.value;
    speedValue.textContent = `Speed: ${speed}`;
}

function resetVisualization() {
    isSorting = false;
    isStepMode = false;
    currentStep = 0;
    const inputArray = arrayInput.value.split(',').map(Number).filter(n => !isNaN(n));
    array1 = [...inputArray];
    array2 = [...inputArray];
    visualizeArray(array1, 'arrayContainer1');
    visualizeArray(array2, 'arrayContainer2');
    document.getElementById('infoText1').textContent = '';
    document.getElementById('infoText2').textContent = '';
}

function toggleCompareMode() {
    compareMode = !compareMode;
    const compareVisualizer = document.getElementById('compareVisualizer');
    compareVisualizer.style.display = compareMode ? 'block' : 'none';
    compareBtn.textContent = compareMode ? 'Hide Comparison' : 'Compare with Another Algorithm';

    if (compareMode) {
        initialAlgorithm = algorithmSelect.value; // Store the initially selected algorithm
        const currentAlgo = initialAlgorithm;
        const otherAlgos = ['selection', 'bubble', 'insertion', 'merge', 'quick'].filter(algo => algo !== currentAlgo);
        algorithmSelect.innerHTML = otherAlgos.map(algo => `<option value="${algo}">${algo.charAt(0).toUpperCase() + algo.slice(1)} Sort</option>`).join('');
    } else {
        algorithmSelect.innerHTML = `
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="bubble">Bubble Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
        `;
        algorithmSelect.value = initialAlgorithm; // Restore the initially selected algorithm
    }
}

async function startSorting() {
    if (isSorting) return;
    resetVisualization();
    isSorting = true;

    const algo1 = compareMode ? initialAlgorithm : algorithmSelect.value;
    const algo2 = compareMode ? algorithmSelect.value : null;

    document.getElementById('algo1Title').textContent = `${algo1.charAt(0).toUpperCase() + algo1.slice(1)} Sort`;
    if (compareMode) {
        document.getElementById('algo2Title').textContent = `${algo2.charAt(0).toUpperCase() + algo2.slice(1)} Sort`;
    }

    const sortPromises = [runAlgorithm(algo1, array1, 'arrayContainer1', 'infoText1')];
    if (compareMode) {
        sortPromises.push(runAlgorithm(algo2, array2, 'arrayContainer2', 'infoText2'));
    }

    await Promise.all(sortPromises);
    isSorting = false;
}

async function runAlgorithm(algoName, arr, containerId, infoId) {
    switch (algoName) {
        case 'selection':
            return selectionSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap);
        case 'bubble':
            return bubbleSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap);
        case 'insertion': // Add this line
            return insertionSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap);
        case 'merge': // Add this line
            return mergeSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap);
        case 'quick': // Add this line
            return quickSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap);
        default:
            console.error(`Unknown algorithm: ${algoName}`);
            setInfo(infoId, `Unknown algorithm: ${algoName}`);
    }
}


function visualizeArray(arr, containerId, selectedIdx = -1, comparingIdx = -1) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const maxVal = Math.max(...arr);

    arr.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (value / maxVal) * 280;
        bar.style.height = `${height}px`;

        if (index === selectedIdx) bar.classList.add('selected');
        else if (index === comparingIdx) bar.classList.add('comparing');
        else if (index < selectedIdx) bar.classList.add('sorted');

        const valueLabel = document.createElement('span');
        valueLabel.className = 'bar-value';
        valueLabel.textContent = value;

        bar.appendChild(valueLabel);
        container.appendChild(bar);
    });
}

async function animateSwap(arr, i, j, containerId) {
    const bars = document.querySelectorAll(`#${containerId} .bar`);
    const animationDuration = 500 + (3 - speed) * 200; // Adjust based on speed
    bars[i].style.animation = `swap ${animationDuration}ms ease-in-out`;
    bars[j].style.animation = `swap ${animationDuration}ms ease-in-out`;
    await sleep(animationDuration); // Wait for the animation to finish
    bars[i].style.animation = '';
    bars[j].style.animation = '';
    visualizeArray(arr, containerId, i, j);
}


function setInfo(infoId, text) {
    document.getElementById(infoId).textContent = text;
}

function handleStep() {
    if (!isSorting) {
        isStepMode = true;
        startSorting();
    } else {
        currentStep++;
    }
}

async function nextStep() {
    if (isStepMode) {
        while (currentStep === 0) {
            await sleep(100);
        }
        currentStep = 0;
    } else {
        await sleep(2000 - (speed - 1) * 400);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize with a random array
generateRandomArray();
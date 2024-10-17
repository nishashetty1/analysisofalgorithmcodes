const nodeInput = document.getElementById('nodeInput');
const generateGraphBtn = document.getElementById('generateGraphBtn');
const startBtn = document.getElementById('startBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const graphContainer = document.getElementById('graphContainer');
const infoText = document.getElementById('infoText');

let graph = [];
let colorAssignments = [];
let currentNode = 0;
let isRunning = false;
let speed = 3;
let chromaticNumber = 0;
let animationId = null;

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

generateGraphBtn.addEventListener('click', generateRandomGraph);
startBtn.addEventListener('click', startVisualization);
stepBtn.addEventListener('click', stepVisualization);
resetBtn.addEventListener('click', resetVisualization);
speedControl.addEventListener('input', debounce(updateSpeed, 100));

function generateRandomGraph() {
    const numNodes = parseInt(nodeInput.value) || 5;
    graph = Array.from({ length: numNodes }, () => []);
    colorAssignments = Array(numNodes).fill(null);

    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            if (Math.random() < 0.5) {
                graph[i].push(j);
                graph[j].push(i);
            }
        }
    }
    visualizeGraph();
}

function updateSpeed() {
    speed = speedControl.value;
    speedValue.textContent = speed;
}

function startVisualization() {
    if (isRunning) return;
    isRunning = true;
    currentNode = 0;
    chromaticNumber = 0;
    colorGraph();
}

function stepVisualization() {
    if (!isRunning) {
        startVisualization();
    } else {
        colorNextNode();
    }
}

function resetVisualization() {
    isRunning = false;
    currentNode = 0;
    chromaticNumber = 0;
    colorAssignments.fill(null);
    visualizeGraph();
    infoText.textContent = '';
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function visualizeGraph() {
    graphContainer.innerHTML = '';
    const containerRect = graphContainer.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    const nodeSize = Math.min(30, radius * 0.2);

    graph.forEach((neighbors, i) => {
        const angle = (i / graph.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const node = document.createElement('div');
        node.className = 'node';
        node.style.width = `${nodeSize}px`;
        node.style.height = `${nodeSize}px`;
        node.style.left = `${x - nodeSize / 2}px`;
        node.style.top = `${y - nodeSize / 2}px`;
        node.style.backgroundColor = colorAssignments[i] || '#ccc';
        node.textContent = i + 1;
        graphContainer.appendChild(node);

        neighbors.forEach(j => {
            if (j > i) {
                const angleJ = (j / graph.length) * 2 * Math.PI;
                const xJ = centerX + radius * Math.cos(angleJ);
                const yJ = centerY + radius * Math.sin(angleJ);

                const edge = document.createElement('div');
                edge.className = 'edge';
                const length = Math.sqrt((xJ - x) ** 2 + (yJ - y) ** 2);
                const angle = Math.atan2(yJ - y, xJ - x);
                edge.style.width = `${length}px`;
                edge.style.left = `${x}px`;
                edge.style.top = `${y}px`;
                edge.style.transform = `rotate(${angle}rad)`;
                graphContainer.appendChild(edge);
            }
        });
    });
}

function isSafe(v, color, c) {
    for (let neighbor of graph[v]) {
        if (color[neighbor] === c) {
            return false;
        }
    }
    return true;
}

function colorGraph() {
    const color = new Array(graph.length).fill(-1);
    chromaticNumber = 0;

    function graphColoringUtil(v) {
        if (v === graph.length) {
            return true;
        }

        for (let c = 0; c < graph.length; c++) {
            if (isSafe(v, color, c)) {
                color[v] = c;
                chromaticNumber = Math.max(chromaticNumber, c + 1);

                if (graphColoringUtil(v + 1)) {
                    return true;
                }

                color[v] = -1; // Reset color
            }
        }

        return false;
    }

    if (graphColoringUtil(0)) {
        colorAssignments = color.map(c => {
            return `hsl(${(c / chromaticNumber) * 360}, 100%, 50%)`;
        });
        currentNode = 0; // Reset currentNode to start coloring from the beginning
        colorNextNode();
    } else {
        infoText.textContent = 'No solution exists';
        isRunning = false;
    }
}

function colorNextNode() {
    if (currentNode >= graph.length) {
        isRunning = false;
        infoText.textContent = `Graph coloring completed! Chromatic number: ${chromaticNumber}`;
        return;
    }

    const usedColors = new Set(
        graph[currentNode]
            .map(neighbor => colorAssignments[neighbor])
            .filter(color => color !== null)
    );

    let chosenColor;
    for (let c = 0; c < chromaticNumber; c++) {
        if (!usedColors.has(`hsl(${(c / chromaticNumber) * 360}, 100%, 50%)`)) {
            chosenColor = `hsl(${(c / chromaticNumber) * 360}, 100%, 50%)`;
            break;
        }
    }

    colorAssignments[currentNode] = chosenColor;
    visualizeGraph();
    infoText.textContent = `Coloring node ${currentNode + 1} with color ${chosenColor}`;

    currentNode++;

    if (isRunning) {
        animationId = setTimeout(() => {
            colorNextNode();
        }, 1000 - speed * 200);
    }
}

// Initialize with a random graph
generateRandomGraph();

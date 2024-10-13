class Graph {
    constructor() {
        this.vertices = new Map();
    }

    addVertex(vertex) {
        if (!this.vertices.has(vertex)) {
            this.vertices.set(vertex, new Map());
            return true;
        }
        return false;
    }

    addEdge(from, to, weight) {
        if (weight < 0) {
            throw new Error("Dijkstra's algorithm does not support negative weights");
        }
        this.addVertex(from);
        this.addVertex(to);
        this.vertices.get(from).set(to, weight);
        this.vertices.get(to).set(from, weight); // Undirected graph
    }

    dijkstra(start) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set(this.vertices.keys());

        this.vertices.forEach((_, vertex) => {
            distances.set(vertex, vertex === start ? 0 : Infinity);
            previous.set(vertex, null);
        });

        while (unvisited.size > 0) {
            let current = null;
            for (let vertex of unvisited) {
                if (current === null || distances.get(vertex) < distances.get(current)) {
                    current = vertex;
                }
            }

            if (distances.get(current) === Infinity) break;

            unvisited.delete(current);

            for (let [neighbor, weight] of this.vertices.get(current)) {
                let alt = distances.get(current) + weight;
                if (alt < distances.get(neighbor)) {
                    distances.set(neighbor, alt);
                    previous.set(neighbor, current);
                }
            }
        }

        return { distances, previous };
    }

    getShortestPath(start, end) {
        const { distances, previous } = this.dijkstra(start);
        const path = [];
        let current = end;

        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }

        return { distance: distances.get(end), path };
    }
}

const graph = new Graph();
let network = null;

function initializeGraph() {
    const container = document.getElementById('mynetwork');
    const data = { nodes: new vis.DataSet(), edges: new vis.DataSet() };
    const options = {
        physics: { enabled: false },
        edges: { font: { align: 'middle' } },
        nodes: { color: { background: '#c8a8aa', border: '#614b3d' } }
    };
    network = new vis.Network(container, data, options);
}

function addVertex() {
    const vertex = document.getElementById('vertexInput').value.trim();
    if (vertex && graph.addVertex(vertex)) {
        updateGraph();
        document.getElementById('vertexInput').value = '';
        displayInfo(`Vertex ${vertex} added.`);
    } else {
        displayInfo('Invalid vertex name or already exists.');
    }
}

function addEdge() {
    const from = document.getElementById('edgeFrom').value.trim();
    const to = document.getElementById('edgeTo').value.trim();
    const weight = parseInt(document.getElementById('edgeWeight').value, 10);

    if (from && to) {
        if (isNaN(weight)) {
            displayInfo('Edge weight must be a number.');
            return;
        }

        if (weight < 0) {
            alert("Negative weights can't be resolved by Dijkstra's algorithm. Please use Bellman-Ford.");
            return;
        }

        try {
            graph.addEdge(from, to, weight);
            updateGraph();
            document.getElementById('edgeFrom').value = '';
            document.getElementById('edgeTo').value = '';
            document.getElementById('edgeWeight').value = '';
            displayInfo(`Edge from ${from} to ${to} with weight ${weight} added.`);
        } catch (error) {
            displayInfo(error.message);
        }
    } else {
        displayInfo('Invalid input for edge.');
    }
}


function updateGraph() {
    const nodes = new vis.DataSet(Array.from(graph.vertices.keys()).map(vertex => ({ id: vertex, label: vertex })));
    const edges = new vis.DataSet();

    graph.vertices.forEach((neighbors, from) => {
        neighbors.forEach((weight, to) => {
            edges.add({ from, to, label: weight.toString() });
        });
    });

    network.setData({ nodes, edges });
}

function runDijkstra() {
    const startVertex = document.getElementById('startVertex').value.trim();
    if (graph.vertices.has(startVertex)) {
        const { distances, previous } = graph.dijkstra(startVertex);
        visualizeDijkstra(startVertex, distances, previous);
    } else {
        displayInfo('Invalid starting vertex.');
    }
}

function getShortestPath() {
    const sourceVertex = document.getElementById('sourceVertex').value.trim();
    const destinationVertex = document.getElementById('destinationVertex').value.trim();

    if (graph.vertices.has(sourceVertex) && graph.vertices.has(destinationVertex)) {
        const { distance, path } = graph.getShortestPath(sourceVertex, destinationVertex);
        visualizeShortestPath(path);
        displayInfo(`Shortest path from ${sourceVertex} to ${destinationVertex}: ${path.join(' -> ')}. Distance: ${distance}`);
    } else {
        displayInfo('Invalid source or destination vertex.');
    }
}

function visualizeDijkstra(start, distances, previous) {
    const nodes = network.body.data.nodes;
    const edges = network.body.data.edges;

    // Reset all nodes and edges to default color
    nodes.update(Array.from(graph.vertices.keys()).map(id => ({ id, color: { background: '#c8a8aa', border: '#614b3d' } })));
    edges.update(edges.get().map(edge => ({ ...edge, color: { color: '#848484' } })));

    // Color the shortest paths
    graph.vertices.forEach((_, vertex) => {
        if (vertex !== start && previous.get(vertex) !== null) {
            let current = vertex;
            while (current !== start) {
                const prev = previous.get(current);
                nodes.update({ id: current, color: { background: '#2ecc71' } });
                edges.update({ from: prev, to: current, color: { color: '#2ecc71' } });
                current = prev;
            }
        }
    });

    // Color the start node
    nodes.update({ id: start, color: { background: '#e74c3c' } });

    displayResults(distances);
}

function visualizeShortestPath(path) {
    const nodes = network.body.data.nodes;
    const edges = network.body.data.edges;

    // Reset all nodes and edges to default color
    nodes.update(Array.from(graph.vertices.keys()).map(id => ({ id, color: { background: '#c8a8aa', border: '#614b3d' } })));
    edges.update(edges.get().map(edge => ({ ...edge, color: { color: '#848484' } })));

    // Color the shortest path
    for (let i = 0; i < path.length - 1; i++) {
        nodes.update({ id: path[i], color: { background: '#2ecc71' } });
        edges.update({ from: path[i], to: path[i + 1], color: { color: '#2ecc71' } });
    }

    // Color the start and end nodes
    nodes.update({ id: path[0], color: { background: '#e74c3c' } });
    nodes.update({ id: path[path.length - 1], color: { background: '#3498db' } });
}

function displayResults(distances) {
    const infoText = document.getElementById('infoText');
    infoText.innerHTML = '<h3>Dijkstra\'s Algorithm Results:</h3>';
    distances.forEach((distance, vertex) => {
        infoText.innerHTML += `<p>Distance to ${vertex}: ${distance === Infinity ? '∞' : distance}</p>`;
    });
}

function displayInfo(message) {
    document.getElementById('infoText').textContent = message;
}

function reset() {
    graph = new Graph();
    updateGraph();
    displayInfo('Graph reset. You can start adding vertices and edges.');
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGraph();
    document.getElementById('addVertexBtn').addEventListener('click', addVertex);
    document.getElementById('addEdgeBtn').addEventListener('click', addEdge);
    document.getElementById('runDijkstraBtn').addEventListener('click', runDijkstra);
    document.getElementById('getShortestPathBtn').addEventListener('click', getShortestPath);
    document.getElementById('resetBtn').addEventListener('click', reset);
});
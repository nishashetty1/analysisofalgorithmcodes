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
        this.addVertex(from);
        this.addVertex(to);
        this.vertices.get(from).set(to, weight);
    }

    bellmanFord(start) {
        const distances = new Map();
        const previous = new Map();
        const vertices = Array.from(this.vertices.keys());

        vertices.forEach(vertex => {
            distances.set(vertex, Infinity);
            previous.set(vertex, null);
        });
        distances.set(start, 0);

        for (let i = 0; i < vertices.length - 1; i++) {
            let updated = false;
            for (const [from, edges] of this.vertices) {
                for (const [to, weight] of edges) {
                    const newDistance = distances.get(from) + weight;
                    if (newDistance < distances.get(to)) {
                        distances.set(to, newDistance);
                        previous.set(to, from);
                        updated = true;
                    }
                }
            }
            if (!updated) break; // Early termination if no updates were made
        }

        // Check for negative-weight cycles
        for (const [from, edges] of this.vertices) {
            for (const [to, weight] of edges) {
                if (distances.get(from) + weight < distances.get(to)) {
                    throw new Error("Graph contains a negative weight cycle");
                }
            }
        }

        return { distances, previous };
    }

    getShortestPath(start, end) {
        const { distances, previous } = this.bellmanFord(start);
        const path = [];
        let current = end;

        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }

        return { distance: distances.get(end), path };
    }
}

class GraphVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.graph = new Graph();
        this.network = null;
        this.initializeNetwork();
    }

    initializeNetwork() {
        const data = { nodes: new vis.DataSet(), edges: new vis.DataSet() };
        const options = {
            physics: { enabled: false },
            edges: {
                font: { align: 'middle' },
                arrows: { to: { enabled: true, scaleFactor: 1 } }
            },
            nodes: { color: { background: '#c8a8aa', border: '#614b3d' } }
        };
        this.network = new vis.Network(this.container, data, options);
    }

    addVertex(vertex) {
        if (this.graph.addVertex(vertex)) {
            this.updateVisualization();
            return true;
        }
        return false;
    }

    addEdge(from, to, weight) {
        this.graph.addEdge(from, to, weight);
        this.updateVisualization();
    }

    updateVisualization() {
        const nodes = new vis.DataSet(Array.from(this.graph.vertices.keys()).map(vertex => ({ id: vertex, label: vertex })));
        const edges = new vis.DataSet();

        this.graph.vertices.forEach((edgeMap, from) => {
            edgeMap.forEach((weight, to) => {
                edges.add({
                    from,
                    to,
                    label: weight.toString(),
                    color: { color: weight < 0 ? '#e74c3c' : '#3498db' }
                });
            });
        });

        this.network.setData({ nodes, edges });
    }

    runBellmanFord(startVertex) {
        if (!this.graph.vertices.has(startVertex)) {
            throw new Error('Invalid starting vertex.');
        }

        const { distances, previous } = this.graph.bellmanFord(startVertex);
        this.visualizeBellmanFord(startVertex, distances, previous);
        return { distances, previous };
    }

    getShortestPath(sourceVertex, destinationVertex) {
        if (!this.graph.vertices.has(sourceVertex) || !this.graph.vertices.has(destinationVertex)) {
            throw new Error('Invalid source or destination vertex.');
        }

        const { distance, path } = this.graph.getShortestPath(sourceVertex, destinationVertex);
        this.visualizeShortestPath(path);
        return { distance, path };
    }

    visualizeBellmanFord(start, distances, previous) {
        const nodes = this.network.body.data.nodes;
        const edges = this.network.body.data.edges;

        // Reset colors
        nodes.update(Array.from(this.graph.vertices.keys()).map(id => ({ id, color: { background: '#c8a8aa', border: '#614b3d' } })));
        edges.update(edges.get().map(edge => ({ ...edge, color: { color: edge.color.color } })));

        // Color the shortest paths
        this.graph.vertices.forEach((_, vertex) => {
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
    }

    visualizeShortestPath(path) {
        const nodes = this.network.body.data.nodes;
        const edges = this.network.body.data.edges;

        // Reset colors
        nodes.update(Array.from(this.graph.vertices.keys()).map(id => ({ id, color: { background: '#c8a8aa', border: '#614b3d' } })));
        edges.update(edges.get().map(edge => ({ ...edge, color: { color: edge.color.color } })));

        // Color the shortest path
        for (let i = 0; i < path.length - 1; i++) {
            nodes.update({ id: path[i], color: { background: '#2ecc71' } });
            edges.update({ from: path[i], to: path[i + 1], color: { color: '#2ecc71' } });
        }

        // Color the start and end nodes
        nodes.update({ id: path[0], color: { background: '#e74c3c' } });
        nodes.update({ id: path[path.length - 1], color: { background: '#3498db' } });
    }

    reset() {
        this.graph = new Graph();
        this.updateVisualization();
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new GraphVisualizer('mynetwork');

    document.getElementById('addVertexBtn').addEventListener('click', () => {
        const vertex = document.getElementById('vertexInput').value.trim();
        if (visualizer.addVertex(vertex)) {
            document.getElementById('vertexInput').value = '';
            displayInfo(`Vertex ${vertex} added.`);
        } else {
            displayInfo('Invalid vertex name or already exists.');
        }
    });

    document.getElementById('addEdgeBtn').addEventListener('click', () => {
        const from = document.getElementById('edgeFrom').value.trim();
        const to = document.getElementById('edgeTo').value.trim();
        const weight = parseFloat(document.getElementById('edgeWeight').value);

        if (from && to && !isNaN(weight)) {
            visualizer.addEdge(from, to, weight);
            document.getElementById('edgeFrom').value = '';
            document.getElementById('edgeTo').value = '';
            document.getElementById('edgeWeight').value = '';
            displayInfo(`Edge from ${from} to ${to} with weight ${weight} added.`);
        } else {
            displayInfo('Invalid input for edge.');
        }
    });

    document.getElementById('runBellmanFordBtn').addEventListener('click', () => {
        const startVertex = document.getElementById('startVertex').value.trim();
        try {
            const { distances } = visualizer.runBellmanFord(startVertex);
            displayResults(distances);
        } catch (error) {
            displayInfo(error.message);
        }
    });

    document.getElementById('getShortestPathBtn').addEventListener('click', () => {
        const sourceVertex = document.getElementById('sourceVertex').value.trim();
        const destinationVertex = document.getElementById('destinationVertex').value.trim();

        try {
            const { distance, path } = visualizer.getShortestPath(sourceVertex, destinationVertex);
            displayInfo(`Shortest path from ${sourceVertex} to ${destinationVertex}: ${path.join(' -> ')}. Distance: ${distance}`);
        } catch (error) {
            displayInfo(error.message);
        }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        visualizer.reset();
        displayInfo('Graph reset. You can start adding vertices and edges.');
    });
});

function displayResults(distances) {
    const infoText = document.getElementById('infoText');
    infoText.innerHTML = '<h3>Bellman-Ford Algorithm Results:</h3>';
    distances.forEach((distance, vertex) => {
        infoText.innerHTML += `<p>Distance to ${vertex}: ${distance === Infinity ? '∞' : distance}</p>`;
    });
}

function displayInfo(message) {
    document.getElementById('infoText').textContent = message;
}
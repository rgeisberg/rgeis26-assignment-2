const canvas = document.getElementById('visualization');
const ctx = canvas.getContext('2d');

let dataPoints = [];
let centroids = [];
let clusters = [];
let maxIterations = 100;
let currentIteration = 0;

// Configuration
const k = 3; // Number of clusters
const pointRadius = 5;

// Generate a new random dataset
function generateDataset(numPoints = 100) {
    dataPoints = [];
    for (let i = 0; i < numPoints; i++) {
        dataPoints.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            cluster: null
        });
    }
    draw();
}

// Distance function
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Initialization methods
function initializeCentroids(method) {
    centroids = [];
    if (method === 'random') {
        for (let i = 0; i < k; i++) {
            centroids.push({ ...dataPoints[Math.floor(Math.random() * dataPoints.length)] });
        }
    } else if (method === 'farthest') {
        centroids.push({ ...dataPoints[Math.floor(Math.random() * dataPoints.length)] });
        while (centroids.length < k) {
            let farthestPoint = null;
            let maxDistance = -1;
            for (const point of dataPoints) {
                let minDistanceToCentroids = Math.min(...centroids.map(c => distance(point, c)));
                if (minDistanceToCentroids > maxDistance) {
                    maxDistance = minDistanceToCentroids;
                    farthestPoint = point;
                }
            }
            centroids.push({ ...farthestPoint });
        }
    } else if (method === 'kmeans++') {
        // Implement KMeans++ initialization
        centroids.push({ ...dataPoints[Math.floor(Math.random() * dataPoints.length)] });
        while (centroids.length < k) {
            let distances = dataPoints.map(point => Math.min(...centroids.map(c => distance(point, c))));
            let sumOfDistances = distances.reduce((a, b) => a + b, 0);
            let threshold = Math.random() * sumOfDistances;
            let cumulativeSum = 0;
            for (let i = 0; i < distances.length; i++) {
                cumulativeSum += distances[i];
                if (cumulativeSum >= threshold) {
                    centroids.push({ ...dataPoints[i] });
                    break;
                }
            }
        }
    } else if (method === 'manual') {
        // Enable manual selection on the canvas
        alert("Click on the canvas to select centroids.");
    }
}

// Assign each data point to the nearest centroid
function assignClusters() {
    clusters = Array(k).fill().map(() => []);
    for (let point of dataPoints) {
        let nearest = centroids.reduce((prev, curr, index) => distance(point, curr) < distance(point, prev) ? curr : prev);
        point.cluster = centroids.indexOf(nearest);
        clusters[point.cluster].push(point);
    }
}

// Move centroids to the average position of their assigned data points
function updateCentroids() {
    for (let i = 0; i < k; i++) {
        let cluster = clusters[i];
        if (cluster.length > 0) {
            centroids[i] = {
                x: cluster.reduce((sum, point) => sum + point.x, 0) / cluster.length,
                y: cluster.reduce((sum, point) => sum + point.y, 0) / cluster.length
            };
        }
    }
}

// Check if the algorithm has converged
function hasConverged(oldCentroids, newCentroids) {
    for (let i = 0; i < k; i++) {
        if (distance(oldCentroids[i], newCentroids[i]) > 0.1) return false;
    }
    return true;
}

// Step through the KMeans algorithm
function stepKMeans() {
    if (currentIteration >= maxIterations) return;

    let oldCentroids = [...centroids];
    assignClusters();
    updateCentroids();

    if (hasConverged(oldCentroids, centroids)) {
        alert("Converged!");
        return;
    }

    currentIteration++;
    draw();
}

// Run KMeans until convergence
function runToConvergence() {
    while (currentIteration < maxIterations) {
        stepKMeans();
    }
}

// Draw the data points and centroids
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw data points
    for (let point of dataPoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = point.cluster === null ? 'gray' : `rgb(${point.cluster * 80}, 100, 150)`;
        ctx.fill();
    }

    // Draw centroids
    for (let i = 0; i < centroids.length; i++) {
        let centroid = centroids[i];
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, pointRadius * 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = `rgb(${i * 80}, 0, 0)`;
        ctx.fill();
    }
}


// Handle user interactions
document.getElementById('new-dataset').addEventListener('click', () => {
    generateDataset();
    draw();
});

document.getElementById('init-method').addEventListener('change', (e) => {
    initializeCentroids(e.target.value);
    draw();
});

document.getElementById('step').addEventListener('click', stepKMeans);

document.getElementById('converge').addEventListener('click', runToConvergence);

document.getElementById('reset').addEventListener('click', () => {
    initializeCentroids(document.getElementById('init-method').value);
    currentIteration = 0;
    draw();
});

// Initialize with a random dataset and draw
generateDataset();
initializeCentroids('random');
draw();

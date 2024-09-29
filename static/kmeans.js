console.log("kmeans.js loaded successfully");
const canvas = document.getElementById('visualization');
const ctx = canvas.getContext('2d');

let dataPoints = [];
let centroids = [];
let clusters = [];
let maxIterations = 100;
let currentIteration = 0;

// Configuration
 // Number of clusters
const pointRadius = 5;
let k = 3;
console.log(`Number of clusters (k): ${k}`);

// Generate a new random dataset
function generateDataset(numPoints = 500) {
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
export function initializeCentroids(method, k) { // Add 'k' as a parameter
    centroids = []; // Make sure centroids is globally accessible or define it here if not already defined
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
        // Allow manual selection on the canvas
        alert("Click on the canvas to select centroids.");
        let canvas = document.getElementById('yourCanvasId'); // Replace with your canvas ID
        let clickHandler = function(event) {
            // Get click position relative to the canvas
            let rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            // Assuming dataPoints are in the same coordinate space as canvas
            centroids.push({ x: x, y: y });
            draw(); // Optional: Update canvas to show new centroids

            // Check if we've selected enough centroids
            if (centroids.length >= k) {
                canvas.removeEventListener('click', clickHandler);
                alert("All centroids selected!");
                // Proceed to the next step in your K-Means algorithm
            }
        };

        // Attach click handler to the canvas
        canvas.addEventListener('click', clickHandler);
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
    if (currentIteration >= maxIterations) return true;

    let oldCentroids = [...centroids];
    assignClusters(); // Function that assigns points to nearest centroids
    updateCentroids(); // Function that recalculates the centroids

    if (hasConverged(oldCentroids, centroids)) {
        alert("Converged!");
        return true; // Return true to indicate convergence
    }

    currentIteration++;
    draw(); // Function that draws the current state of clusters and centroids

    return false; // Not yet converged, keep running
}

// Run KMeans until convergence
function runToConvergence() {
    while (currentIteration < maxIterations) {
        if (stepKMeans()) {
            break; // Stop the loop if converged or max iterations reached
        }
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
        console.log(`Centroid ${i}: x = ${centroid.x}, y = ${centroid.y}`);
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, pointRadius * 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = `rgb(${i * 80}, 0, 0)`;
        ctx.fill();
    }
}
// Example of running the existing K-Means process
export function kMeans(dataset, kValue, initialCentroids) {
    centroids = initialCentroids; // Set initial centroids
    clusters = Array(kValue).fill().map(() => []); // Reset clusters
    maxIterations = 100; // Set max iterations
    currentIteration = 0; // Reset iteration counter

    while (currentIteration < maxIterations) {
        // Step 1: Assign points to the nearest centroids using the existing `assignClusters` function
        assignClusters(); 

        // Step 2: Update centroids using the existing `updateCentroids` function
        let oldCentroids = [...centroids]; // Store a copy of old centroids before updating
        updateCentroids();

        // Step 3: Check for convergence using the existing `hasConverged` function
        if (hasConverged(oldCentroids, centroids)) {
            console.log("Converged!");
            break; // Stop if centroids have converged
        }

        currentIteration++; // Increment the iteration counter
    }

    // Return the final clusters and centroids
    return { clusters, centroids };
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

document.addEventListener('kValueChanged', (e) => {
    k = e.detail;
    initializeCentroids('random',k);
    assignClusters();
    

    // Use updatedK in your k-means logic
});


// Initialize with a random dataset and draw
generateDataset();
initializeCentroids('random');
draw();


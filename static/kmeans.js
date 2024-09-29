console.log("kmeans.js loaded successfully");
//const canvas = document.getElementById('visualization');
//const ctx = canvas.getContext('2d');


let centroids = [];
let clusters = [];
let maxIterations = 100;
let currentIteration = 0;
let dataset = [];  // Declare 'dataset' globally
let dataPoints = [];  // Declare 'dataPoints' globally

// Configuration
 // Number of clusters
const pointRadius = 5;
let k = 3;
console.log(`Number of clusters (k): ${k}`);
export function plotData(points) {
    const trace = {
        x: points.map(p => p.x),  // X values
        y: points.map(p => p.y),  // Y values
        mode: 'markers',  // Display as scatter plot
        type: 'scatter',
        marker: { size: 10, color: 'blue' }
    };

    const layout = {
        title: 'KMeans Clustering Data',
        xaxis: { range: [-10, 10], title: 'X' },
        yaxis: { range: [-10, 10], title: 'Y' },
        width: 800,
        height: 600
    };

    Plotly.newPlot('graph-container', [trace], layout);  // Plot the data in the graph-container div
}

async function generateDataset() {
    console.log("Generating new dataset...");
    // Simulate dataset generation or fetch from API
    const response = await fetch('/generate_dataset');  // Replace with actual dataset source

    if (response.ok) {
        dataset = await response.json();  // Assuming the dataset is in JSON format
        console.log("Dataset generated:", dataset);

        // Ensure 'dataPoints' is populated based on 'dataset'
        dataPoints = dataset.map(point => ({
            x: point.x, 
            y: point.y
        }));

        console.log("Data points for KMeans:", dataPoints);

        plotData(dataset);  // Plot the dataset if necessary

        // Enable buttons after generating the dataset
        document.getElementById('step').disabled = false;
        document.getElementById('converge').disabled = false;
    } else {
        console.error("Failed to generate dataset");
    }
}



// Distance function
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Initialization methods
export function initializeCentroids(method, k) {
    
    // Ensure dataPoints exist and are valid before proceeding
    if (!dataPoints || dataPoints.length === 0) {
        console.error("Data points are not available for initializing centroids.");
        return;
    }

    if (method === 'random') {
        // Random initialization: Pick 'k' random points from the dataset
        for (let i = 0; i < k; i++) {
            let randomIndex = Math.floor(Math.random() * dataPoints.length);
            centroids.push({ ...dataPoints[randomIndex] });
        }
    } else if (method === 'farthest') {
        // Farthest point initialization: Start with one random point, then pick the farthest points
        centroids.push({ ...dataPoints[Math.floor(Math.random() * dataPoints.length)] });
        while (centroids.length < k) {
            let farthestPoint = null;
            let maxDistance = -1;
            for (const point of dataPoints) {
                // Calculate the minimum distance from the point to any of the centroids
                let minDistanceToCentroids = Math.min(...centroids.map(c => distance(point, c)));
                // Find the point that is farthest away from the closest centroid
                if (minDistanceToCentroids > maxDistance) {
                    maxDistance = minDistanceToCentroids;
                    farthestPoint = point;
                }
            }
            centroids.push({ ...farthestPoint });
        }
    } else if (method === 'kmeans++') {
        // KMeans++ initialization: Select an initial random centroid and probabilistically select others
        centroids.push({ ...dataPoints[Math.floor(Math.random() * dataPoints.length)] });
        while (centroids.length < k) {
            // Calculate the distance of each point to the nearest centroid
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
        alert("Click on the plot to select centroids.");

        let clicksRemaining = k;  // Track how many centroids need to be selected

        // Add event listener for plot clicks
        let plotElement = document.getElementById('graph-container');
        let clickHandler = function(eventData) {
            if (eventData && eventData.points && eventData.points.length > 0) {
                let point = eventData.points[0];  // Get the first clicked point
                let x = point.x;
                let y = point.y;

                // Add the selected point as a centroid
                centroids.push({ x: x, y: y });
                console.log(`Centroid selected: x=${x}, y=${y}`);

                clicksRemaining--;

                // Plot the selected centroids
                plotClusters([], centroids);

                if (clicksRemaining === 0) {
                    // Remove the event listener when we've selected enough centroids
                    plotElement.removeEventListener('plotly_click', clickHandler);
                    console.log("All centroids have been selected:", centroids);
                    alert("All centroids selected!");

                    // Proceed with the rest of the KMeans algorithm
                    performKMeans('manual');
                }
            }
        };

        // Add event listener for clicks on the Plotly graph
        plotElement.on('plotly_click', clickHandler);
    }
    

    // Final check to ensure centroids were successfully initialized
    if (!centroids || centroids.length === 0) {
        console.error("Centroids are not initialized.");
        return;
    }

    console.log("Centroids initialized:", centroids); // Debugging log to check if centroids are initialized
    plotClusters(clusters, centroids); // Plot the clusters and centroids
    return centroids; // Return centroids for further use
}



// Assign each data point to the nearest centroid
function assignClusters() {
    clusters = Array(k).fill().map(() => []);
    for (let point of dataPoints) {
        let nearest = centroids.reduce((prev, curr) => 
            distance(point, curr) < distance(point, prev) ? curr : prev
        );
        point.cluster = centroids.indexOf(nearest);
        clusters[point.cluster].push(point);
    }

    // Update Plotly graph
    plotClusters(clusters, centroids); // Call this after assigning clusters
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
    plotClusters(clusters, centroids);
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
    //draw(); // Function that draws the current state of clusters and centroids
    plotClusters(clusters,centroids);
    return false; // Not yet converged, keep running
}

// Run KMeans until convergence
function runToConvergence() {
    while (currentIteration < maxIterations) {
        if (stepKMeans(plotClusters)) {
            break; // Stop the loop if converged or max iterations reached
        }
    }
}
function plotClusters(clusters, centroids) {
    if (!clusters || clusters.length === 0 || !centroids || centroids.length === 0) {
        console.error("Clusters or centroids are not defined properly", clusters, centroids);
        return;
    }

    const clusterTraces = clusters.map((cluster, index) => {
        return {
            x: cluster.map(p => p.x),
            y: cluster.map(p => p.y),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 10 },
            name: `Cluster ${index + 1}`
        };
    });

    const centroidTrace = {
        x: centroids.map(c => c.x),
        y: centroids.map(c => c.y),
        mode: 'markers',
        type: 'scatter',
        marker: { size: 15, symbol: 'x', color: 'red' },
        name: 'Centroids'
    };

    const layout = {
        title: 'KMeans Clustering Data',
        xaxis: { range: [-10, 10], title: 'X' },
        yaxis: { range: [-10, 10], title: 'Y' },
        width: 800,
        height: 600
    };

    // Update or create the plot using Plotly
    Plotly.react('graph-container', [...clusterTraces, centroidTrace], layout);
}

// Draw the data points and centroids

    // function draw() {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    //     // Draw data points
    //     for (let point of dataPoints) {
    //         ctx.beginPath();
    //         ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
    //         ctx.fillStyle = point.cluster === null ? 'gray' : `rgb(${point.cluster * 80}, 100, 150)`;
    //         ctx.fill();
    //     }

    //     // Draw centroids
    //     for (let i = 0; i < centroids.length; i++) {
    //         let centroid = centroids[i];
    //         console.log(`Centroid ${i}: x = ${centroid.x}, y = ${centroid.y}`);
    //         ctx.beginPath();
    //         ctx.arc(centroid.x, centroid.y, pointRadius * 1.5, 0, 2 * Math.PI);
    //         ctx.fillStyle = `rgb(${i * 80}, 0, 0)`;
    //         ctx.fill();
    //     }
    // }

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
   // draw();
});

document.getElementById('init-method').addEventListener('change', (e) => {
    initializeCentroids(e.target.value);
   // draw();
});

document.getElementById('step').addEventListener('click', stepKMeans);

document.getElementById('converge').addEventListener('click', runToConvergence);

document.getElementById('reset').addEventListener('click', () => {
    initializeCentroids(document.getElementById('init-method').value);
    currentIteration = 0;
    //draw();
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
//draw();


import {
    kMeans,
    randomInit,
    farthestFirstInit,
    kmeansPlusPlusInit,
    assignClusters,
    updateCentroids
} from './kmeans.js';  // Import your custom KMeans functions

document.addEventListener('DOMContentLoaded', function () {
    console.log("index.js is loaded and ready!");

    let dataset = [];
    let centroids = [];
    let clusters = [];
    let steps = [];
    let currentStep = 0;

    // Function to generate a new dataset
    async function generateDataset() {
        console.log("Generating new dataset...");
        const response = await fetch('/generate_dataset');
        if (response.ok) {
            dataset = await response.json();
            console.log("Dataset generated:", dataset);
            plotData(dataset);  // Plot the dataset using Plotly

            // Enable the step-through and converge buttons after generating a new dataset
            document.getElementById('step-through').disabled = false;
            document.getElementById('converge').disabled = false;
        } else {
            console.error("Failed to generate dataset");
        }
    }

    // Function to plot the data using Plotly.js
    function plotData(points) {
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

    // Function to perform KMeans clustering using custom algorithms
    async function performKMeans(initMethod) {

        
        // Using the custom KMeans implementation from your `kmeans.js`
        let centroids;
        switch (initMethod) {
            case 'random':
                centroids = randomInit(dataset, kValue);
                break;
            case 'farthest':
                centroids = farthestFirstInit(dataset, kValue);
                break;
            case 'kmeans++':
                centroids = kmeansPlusPlusInit(dataset, kValue);
                break;
            default:
                centroids = randomInit(dataset, kValue);
        }

        const result = kMeans(dataset, kValue, centroids);  // Call your custom KMeans function
        clusters = result.clusters;
        centroids = result.centroids;

        plotClusters(clusters, centroids);  // Plot the resulting clusters and centroids
    }

    // Function to plot clusters and centroids using Plotly.js
    function plotClusters(clusters, centroids) {
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

        Plotly.newPlot('graph-container', [...clusterTraces, centroidTrace], layout);  // Plot clusters and centroids
    }

    // Add event listeners to buttons
    document.getElementById('generate-dataset').addEventListener('click', () => {generateDataset(); });
    document.getElementById('step-through').addEventListener('click', () => performKMeans('random'));
    document.getElementById('converge').addEventListener('click', () => performKMeans('kmeans++'));
    document.getElementById('reset').addEventListener('click', () => plotData(dataset));  // Reset to original data
});

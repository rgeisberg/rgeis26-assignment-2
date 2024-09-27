import {
    kMeans,
    randomInit,
    farthestFirstInit,
    kmeansPlusPlusInit,
    assignClusters,
    updateCentroids
} from './kmeans.js';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('visualization-canvas');
    const ctx = canvas.getContext('2d');

    // Initialize the canvas size
    canvas.width = 800;
    canvas.height = 600;

    let dataset = [];
    let centroids = [];
    let clusters = [];

    // Function to generate a new dataset
    async function generateDataset() {
        const response = await fetch('/generate_dataset');
        dataset = await response.json();
        drawPoints(dataset);
    }

    // Function to perform KMeans clustering
    async function performKMeans(initMethod, k) {
                let currentStep = 0;
        let steps = [];

        async function performKMeans(initMethod, k) {
            const response = await fetch('/kmeans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: dataset,
                    k: k,
                    initMethod: initMethod
                })
            });
            const result = await response.json();
            steps = result.steps;  // Backend should now return an array of steps
            currentStep = 0;
            displayStep();
        }

        function displayStep() {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                centroids = step.centroids;
                clusters = step.clusters;
                drawClusters(clusters, centroids);
                currentStep++;
            }
        }

        // Add event listener for step through button
        document.getElementById('step-through').addEventListener('click', displayStep);
    }

    // Function to draw data points on the canvas
    function drawPoints(points) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
        });
    }

    // Function to draw clusters and centroids
    function drawClusters(clusters, centroids) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
        clusters.forEach((cluster, index) => {
            cluster.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = colors[index % colors.length];
                ctx.fill();
            });
        });

        centroids.forEach(centroid => {
            ctx.beginPath();
            ctx.arc(centroid.x, centroid.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        });
    }

    // Add event listeners to buttons
    document.getElementById('generate-dataset').addEventListener('click', generateDataset);
    document.getElementById('step-through').addEventListener('click', () => performKMeans('random', 3));  // Example with random method and k = 3
    document.getElementById('converge').addEventListener('click', () => performKMeans('kmeans++', 3));   // Example with kmeans++ method and k = 3
    document.getElementById('reset').addEventListener('click', () => drawPoints(dataset));
});

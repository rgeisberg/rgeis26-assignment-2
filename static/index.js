import { initializeCentroids, kMeans, plotData } from './kmeans.js';

console.log("index.js loaded successfully");
;  // Import your custom KMeans functions

document.addEventListener('DOMContentLoaded', function () {
    console.log("index.js is loaded and ready!");

    let dataset = [];
    let centroids = [];
    let clusters = [];
    let steps = [];
    let currentStep = 0;
    let kValue = 3;

    // Function to generate a new dataset
    async function generateDataset() {
        console.log("Generating new dataset...");
        const response = await fetch('/generate_dataset');
        if (response.ok) {
            dataset = await response.json();
            console.log("Dataset generated:", dataset);
            plotData(dataset);  // Plot the dataset using Plotly

            // Enable the step-through and converge buttons after generating a new dataset
            document.getElementById('step').disabled = false;
            document.getElementById('converge').disabled = false;
        } else {
            console.error("Failed to generate dataset");
        }
    }

    // Function to plot the data using Plotly.js
    

    // Function to perform KMeans clustering using custom algorithms
    async function performKMeans(initMethod) {

        
        // Using the custom KMeans implementation from your `kmeans.js`
        let centroids;
        switch (initMethod) {
            case 'random':
                centroids = initializeCentroids(dataset, kValue);
                break;
            case 'farthest':
                centroids = initializeCentroids(dataset, kValue);
                break;
            case 'kmeans++':
                centroids = initializeCentroids(dataset, kValue);
                break;
            default:
                centroids = initializeCentroids(dataset, kValue);
        }

        const result = kMeans(dataset, kValue, centroids);  // Call your custom KMeans function
        clusters = result.clusters;
        centroids = result.centroids;
         // Plot the resulting clusters and centroids
    }

    // Function to plot clusters and centroids using Plotly.js
   
    

    // Add event listeners to buttons
    document.getElementById('new-dataset').addEventListener('click', async () => {
        await generateDataset();  // Generate the dataset when the user clicks 'New Dataset'
        console.log("Dataset generation complete.");
    });
    
    document.getElementById('step').addEventListener('click', async () => {
        if (!dataPoints || dataPoints.length === 0) {
            console.log("Dataset is empty. Generating new dataset...");
            await generateDataset();  // Ensure the dataset is generated before performing KMeans
        }
        performKMeans('random');  // Perform KMeans with the 'random' method
    });
    
    document.getElementById('converge').addEventListener('click', async () => {
        if (!dataPoints || dataPoints.length === 0) {
            console.log("Dataset is empty. Generating new dataset...");
            await generateDataset();  // Ensure the dataset is generated before performing KMeans
        }
        performKMeans('kmeans++');  // Perform KMeans with the 'kmeans++' method
    });
    
    document.getElementById('reset').addEventListener('click', () => {
        if (!dataset || dataset.length === 0) {
            console.error("Dataset is not available for reset.");
            return;
        }
        plotData(dataset);  // Reset to the original dataset visualization
    });
    
    document.getElementById('set-k').addEventListener('click', () => {
        let newK = parseInt(document.getElementById('numberInput').value);
        if (!isNaN(newK) && newK > 0) {
            kValue = newK;
            document.dispatchEvent(new CustomEvent('kValueChanged', { detail: kValue }));
            console.log(`Dispatching kValueChanged event with k = ${kValue}`);
        } else {
            alert('Please enter a valid number greater than 0.');
        }
    });
    
});

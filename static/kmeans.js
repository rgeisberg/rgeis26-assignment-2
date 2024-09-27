const readline = require('readline');

// Function to calculate Euclidean distance between two points
function euclideanDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

// Function to find the mean of an array of points
function mean(points) {
    let sumX = 0, sumY = 0;
    points.forEach(point => {
        sumX += point.x;
        sumY += point.y;
    });
    return { x: sumX / points.length, y: sumY / points.length };
}

// Random initialization: select k random points from the dataset
function randomInit(data, k) {
    const centroids = [];
    while (centroids.length < k) {
        const randomIndex = Math.floor(Math.random() * data.length);
        if (!centroids.some(centroid => centroid === data[randomIndex])) {
            centroids.push({ ...data[randomIndex] });
        }
    }
    return centroids;
}

// Farthest First initialization
function farthestFirstInit(data, k) {
    const centroids = [data[Math.floor(Math.random() * data.length)]];
    while (centroids.length < k) {
        let maxDistance = -Infinity;
        let newCentroid;
        data.forEach(point => {
            const minDistance = Math.min(...centroids.map(centroid => euclideanDistance(point, centroid)));
            if (minDistance > maxDistance) {
                maxDistance = minDistance;
                newCentroid = point;
            }
        });
        centroids.push(newCentroid);
    }
    return centroids;
}

// KMeans++ initialization
function kmeansPlusPlusInit(data, k) {
    const centroids = [data[Math.floor(Math.random() * data.length)]];
    while (centroids.length < k) {
        const distances = data.map(point => {
            const minDistance = Math.min(...centroids.map(centroid => euclideanDistance(point, centroid)));
            return Math.pow(minDistance, 2);
        });
        const totalDistance = distances.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalDistance;
        for (let i = 0; i < data.length; i++) {
            if (r < distances[i]) {
                centroids.push(data[i]);
                break;
            }
            r -= distances[i];
        }
    }
    return centroids;
}

// Assign each point to the nearest centroid
function assignClusters(data, centroids) {
    const clusters = new Array(centroids.length).fill().map(() => []);
    data.forEach(point => {
        let minDistance = Infinity;
        let clusterIndex = -1;
        centroids.forEach((centroid, index) => {
            const distance = euclideanDistance(point, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                clusterIndex = index;
            }
        });
        clusters[clusterIndex].push(point);
    });
    return clusters;
}

// Recalculate the centroids based on current cluster assignments
function updateCentroids(clusters) {
    return clusters.map(cluster => mean(cluster));
}

function hasConverged(previous, current) {
    if (previous.length === 0) return false;
    for (let i = 0; i < current.length; i++) {
        if (euclideanDistance(previous[i], current[i]) > 0.0001) return false;
    }
    return true;
}

function kMeans(data, k, initMethod = 'random') {
    let centroids;
    switch (initMethod) {
        case 'random':
            centroids = randomInit(data, k);
            break;
        case 'farthest':
            centroids = farthestFirstInit(data, k);
            break;
        case 'kmeans++':
            centroids = kmeansPlusPlusInit(data, k);
            break;
        default:
            throw new Error('Unknown initialization method: ' + initMethod);
    }

    let iterations = 0;
    let previousCentroids = [];

    while (!hasConverged(previousCentroids, centroids) && iterations < 100) {
        previousCentroids = centroids;
        const clusters = assignClusters(data, centroids);
        centroids = updateCentroids(clusters);
        iterations++;
    }

    return { centroids, clusters: assignClusters(data, centroids) };
}

// Setting up the interface for reading and writing via stdin and stdout
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// Read input from stdin, process KMeans, and output the result to stdout
rl.on('line', (input) => {
    const { data, k, initMethod } = JSON.parse(input);
    const result = kMeans(data, k, initMethod);
    console.log(JSON.stringify(result));
});


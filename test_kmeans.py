import numpy as np
from kmeans import KMeans

# Helper function to generate synthetic 2D data
def generate_data(n_samples=100, n_features=2):
    np.random.seed(42)  # For reproducibility
    return np.random.rand(n_samples, n_features)

# Function to test random initialization
def test_random_initialization():
    print("Testing Random Initialization")
    data = generate_data()
    kmeans = KMeans(n_clusters=3, init_method='random')
    centroids = kmeans.initialize_centroids(data)
    print("Initial Centroids:\n", centroids)
    assert centroids.shape == (3, 2), "Random Initialization failed!"
    print("Random Initialization Passed!\n")

# Function to test farthest first initialization
def test_farthest_initialization():
    print("Testing Farthest First Initialization")
    data = generate_data()
    kmeans = KMeans(n_clusters=3, init_method='farthest')
    centroids = kmeans.initialize_centroids(data)
    print("Initial Centroids:\n", centroids)
    assert centroids.shape == (3, 2), "Farthest First Initialization failed!"
    print("Farthest First Initialization Passed!\n")

# Function to test KMeans++ initialization
def test_kmeans_plus_plus_initialization():
    print("Testing KMeans++ Initialization")
    data = generate_data()
    kmeans = KMeans(n_clusters=3, init_method='kmeans++')
    centroids = kmeans.initialize_centroids(data)
    print("Initial Centroids:\n", centroids)
    assert centroids.shape == (3, 2), "KMeans++ Initialization failed!"
    print("KMeans++ Initialization Passed!\n")

# Function to test manual initialization
def test_manual_initialization():
    print("Testing Manual Initialization")
    data = generate_data()
    manual_centroids = [[0.2, 0.2], [0.5, 0.5], [0.8, 0.8]]
    kmeans = KMeans(n_clusters=3, init_method='manual', manual_centroids=manual_centroids)
    centroids = kmeans.initialize_centroids(data)
    print("Initial Centroids:\n", centroids)
    assert np.array_equal(centroids, np.array(manual_centroids)), "Manual Initialization failed!"
    print("Manual Initialization Passed!\n")

# Function to test one step of the clustering process
def test_clustering_step():
    print("Testing Clustering Step")
    data = generate_data()
    kmeans = KMeans(n_clusters=3, init_method='random')
    kmeans.initialize_centroids(data)
    centroids, labels, converged = kmeans.fit_step()
    print("Centroids after one step:\n", centroids)
    print("Labels:\n", labels)
    print("Converged:", converged)
    assert labels.shape == (100,), "Clustering step failed!"
    print("Clustering Step Passed!\n")

# Function to test full clustering until convergence
def test_clustering_full():
    print("Testing Full Clustering")
    data = generate_data()
    kmeans = KMeans(n_clusters=3, init_method='kmeans++')
    kmeans.fit(data)  # Pass data to the fit method
    print("Final Centroids:\n", kmeans.centroids)
    print("Final Labels:\n", kmeans.labels)
    assert kmeans.centroids.shape == (3, 2), "Full clustering failed!"
    print("Full Clustering Passed!\n")

# Function to test visualization of clusters
def test_visualization():
    print("Testing Visualization")
    data = generate_data()
    kmeans = KMeans(n_clusters=3, init_method='random')
    kmeans.fit()
    kmeans.plot_clusters()
    print("Visualization Completed!\n")

# Main testing function to call all test cases
def main():
    test_random_initialization()
    test_farthest_initialization()
    test_kmeans_plus_plus_initialization()
    test_manual_initialization()
    test_clustering_step()
    test_clustering_full()
    test_visualization()

if __name__ == "__main__":
    main()

import numpy as np
import matplotlib.pyplot as plt
from scipy.spatial.distance import cdist

class KMeans:
    def __init__(self, n_clusters=3, init_method='random', manual_centroids=None):
        """
        Initializes the KMeans clustering algorithm.

        Parameters:
        - n_clusters (int): Number of clusters to form.
        - init_method (str): Method for initializing centroids. Options: 'random', 'farthest', 'kmeans++', 'manual'.
        - manual_centroids (list): List of initial centroids for manual initialization.
        """
        self.n_clusters = n_clusters
        self.init_method = init_method
        self.manual_centroids = manual_centroids
        self.centroids = None
        self.data = None
        self.labels = None

    def initialize_centroids(self, data):
        """Initializes centroids based on the selected initialization method."""
        self.data = data
        if self.init_method == 'random':
            indices = np.random.choice(data.shape[0], self.n_clusters, replace=False)
            self.centroids = data[indices]
        elif self.init_method == 'farthest':
            self.centroids = self.farthest_initialization(data)
        elif self.init_method == 'kmeans++':
            self.centroids = self.kmeans_plus_plus_initialization(data)
        elif self.init_method == 'manual':
            self.centroids = np.array(self.manual_centroids)
        else:
            raise ValueError("Invalid initialization method selected.")
        return self.centroids

    def farthest_initialization(self, data):
        """Farthest first initialization method."""
        centroids = [data[np.random.randint(data.shape[0])]]
        while len(centroids) < self.n_clusters:
            distances = cdist(data, np.array(centroids)).min(axis=1)
            next_centroid = data[np.argmax(distances)]
            centroids.append(next_centroid)
        return np.array(centroids)

    def kmeans_plus_plus_initialization(self, data):
        """KMeans++ initialization method."""
        centroids = [data[np.random.randint(data.shape[0])]]
        while len(centroids) < self.n_clusters:
            distances = cdist(data, np.array(centroids)).min(axis=1)
            prob = distances / distances.sum()
            cumulative_prob = np.cumsum(prob)
            r = np.random.rand()
            for i, p in enumerate(cumulative_prob):
                if r < p:
                    centroids.append(data[i])
                    break
        return np.array(centroids)

    def assign_labels(self, data):
        """Assigns each data point to the nearest centroid."""
        distances = cdist(data, self.centroids)
        self.labels = np.argmin(distances, axis=1)
        return self.labels

    def update_centroids(self):
        """Calculates new centroids as the mean of assigned points."""
        new_centroids = np.array([self.data[self.labels == i].mean(axis=0) for i in range(self.n_clusters)])
        return new_centroids

    def fit_step(self):
        """Performs one step of the KMeans algorithm."""
        self.labels = self.assign_labels(self.data)
        new_centroids = self.update_centroids()
        converged = np.all(new_centroids == self.centroids)
        self.centroids = new_centroids
        return self.centroids, self.labels, converged

    def fit(self, data=None, max_iters=100):
        """Runs the KMeans algorithm until convergence or maximum iterations."""
        if data is not None:
            self.data = data
        if self.data is None:
            raise ValueError("Data must be provided either during initialization or in the fit() method.")
        
        self.initialize_centroids(self.data)
        for _ in range(max_iters):
            centroids, labels, converged = self.fit_step()
            if converged:
                break
        return self.centroids, self.labels

    def plot_clusters(self):
        """Plots the data points and centroids in a 2D scatter plot."""
        if self.data.shape[1] != 2:
            raise ValueError("Data must be 2-dimensional for visualization.")
        plt.scatter(self.data[:, 0], self.data[:, 1], c=self.labels, cmap='viridis', marker='o', label='Data Points')
        plt.scatter(self.centroids[:, 0], self.centroids[:, 1], s=300, c='red', marker='X', label='Centroids')
        plt.title("KMeans Clustering")
        plt.xlabel("X")
        plt.ylabel("Y")
        plt.legend()
        plt.show()

if __name__ == "__main__":
    # Test the KMeans implementation
    np.random.seed(42)
    data = np.random.rand(100, 2)  # Generate random 2D data

    # Example usage
    kmeans = KMeans(n_clusters=3, init_method='kmeans++')
    kmeans.initialize_centroids(data)
    for i in range(10):
        centroids, labels, converged = kmeans.fit_step()
        print(f"Iteration {i+1}: Centroids:\n{centroids}\n")
        if converged:
            print("Converged!")
            break

    kmeans.plot_clusters()

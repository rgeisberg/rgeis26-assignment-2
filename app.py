import subprocess
import json
from flask import Flask, render_template, jsonify, request

app = Flask(__name__, static_folder='static', template_folder='templates')


# Route to render the main HTML page
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to generate a new random dataset
@app.route('/generate_dataset', methods=['GET'])
def generate_dataset():
    import random
    data = [{'x': random.uniform(-10, 10), 'y': random.uniform(-10, 10)} for _ in range(200)]
    return jsonify(data)


# API endpoint to perform KMeans clustering
@app.route('/kmeans', methods=['POST'])
def perform_kmeans():
    data = request.json['data']
    k = request.json['k']  # Get the value of k from the request
    init_method = request.json['initMethod']
    result = run_kmeans(data, k, init_method)
    return jsonify(result)


def run_kmeans(data, k, init_method):
    # Prepare the input data for the Node.js script
    input_data = {
        'data': data,
        'k': k,
        'initMethod': init_method
    }

    # Run the Node.js script using subprocess
    process = subprocess.Popen(
        ['node', 'static/kmeans.js'],  # Ensure this path points to your kmeans.js file
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    # Send the input data to the Node.js script and capture the output
    stdout, stderr = process.communicate(input=json.dumps(input_data).encode())

    if process.returncode != 0:
        raise Exception(f"Node.js script failed with error: {stderr.decode()}")

    # Parse the output from the Node.js script
    result = json.loads(stdout.decode())
    return {
        "centroids": result['centroids'],
        "clusters": result['clusters'],
        "steps": result.get('steps', [])  # Include steps if returned by the Node.js script
    }

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3000, debug=True)  # Set host to '127.0.0.1' to use localhost

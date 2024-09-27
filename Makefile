# Install dependencies for both Python and Node.js
install:
	# Create a Python virtual environment and install dependencies
	python -m venv venv
	venv/bin/pip install -r requirements.txt
	# Install Node.js dependencies for the kmeans.js file
	npm install --prefix static

# Run the web application on localhost:3000
run:
	# Ensure Flask runs on port 3000 as required
	venv/bin/flask run --host=0.0.0.0 --port=3000

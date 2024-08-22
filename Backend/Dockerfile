# Use an official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.12

# Copy local code to the container image.
WORKDIR /app
COPY . .

# Install production dependencies.
RUN pip install -r requirements.txt
RUN pip install gunicorn

# Service must listen to $PORT environment variable.
# This default value facilitates local development.
ENV PORT 8080

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 0 --threads 8 main:app
FROM python:3.11-slim

WORKDIR /app

# Install required Python packages
RUN pip install --no-cache-dir \
    matplotlib \
    plotly \
    pandas \
    numpy

# Create required directories at root level to match volume mounts
RUN mkdir -p /scripts /outputs && chmod 777 /outputs

# Set Python to unbuffered mode
ENV PYTHONUNBUFFERED=1

# Set security constraints
ENV DOCKER_CONTAINER_TIMEOUT=300
ENV DOCKER_MEMORY_LIMIT="512m"
ENV DOCKER_CPU_LIMIT="0.5"
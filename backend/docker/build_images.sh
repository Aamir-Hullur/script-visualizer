#!/bin/bash

chmod +x build_images.sh

echo "Building Python visualization image..."
docker build -t python-viz:latest -f python/Dockerfile .

echo "Building R visualization image..."
docker build -t r-viz:latest -f r/Dockerfile .

echo "Done building images!"
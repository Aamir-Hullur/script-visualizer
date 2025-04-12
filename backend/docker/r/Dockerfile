FROM r-base:latest

WORKDIR /app

# Install system dependencies including graphics device requirements
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libxml2-dev \
    libssl-dev \
    libcairo2-dev \
    libxt-dev \
    x11-common \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c('ggplot2', 'htmlwidgets', 'Cairo'), repos='http://cran.rstudio.com/')"

# Create required directories and set permissions
RUN mkdir -p /scripts /outputs && \
    chmod 777 /scripts && \
    chmod 777 /outputs && \
    chmod 777 /app

# Set R specific environment variables
ENV R_HOME=/usr/lib/R
ENV R_LIBS=/usr/lib/R/library

# Create and set permissions for R temporary directory
RUN mkdir -p /tmp/R && chmod 777 /tmp/R
ENV TMPDIR=/tmp/R

# Configure R to use Cairo for graphics device
RUN echo "options(bitmapType='cairo')" > /etc/R/Rprofile.site
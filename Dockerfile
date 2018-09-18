FROM nodesource/nsolid:latest

LABEL maintainer "Joe McCann <joe@nodesource.com>"

# Install our dependencies (libfontconfig for phantomjs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    bzip2 \
    ca-certificates \
    curl \
    git \
    libfontconfig \
    python-software-properties \
    && rm -rf /var/lib/apt/lists/*

# this is faster via npm run build-docker
COPY package.json ./package.json
RUN npm install --devDependencies \
    && npm cache verify
# Copy source over and create configs dir
COPY . .

EXPOSE 8080
ENV NODE_ENV=production

CMD ["npm", "start"]

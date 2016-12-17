FROM nodesource/nsolid:boron-2.1.0

MAINTAINER Joe McCann <joe@nodesource.com>

# Install our dependencies (libfontconfig for phantomjs)
RUN apt-get update && apt-get install -y --no-install-recommends \
      bzip2 \
      ca-certificates \
      curl \
      git \
      libfontconfig \
      python-software-properties \
    && rm -rf /var/lib/apt/lists/*

# deps.json only has the dependencies from the package.json.
# this is faster via npm run build-docker
COPY package.json ./package.json
RUN npm install

# Copy source over and create configs dir
COPY . .
RUN mkdir -p /configs

# Trim the fat
RUN apt-get purge -y ${BUILD_DEPS} \
    && apt-get autoremove -y 

EXPOSE 8080
ENV NODE_ENV=production

CMD ["npm", "start"]
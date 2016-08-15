FROM nodesource/nsolid:v1.4.0

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

# Install app dependencies
COPY package.json package.json
RUN npm install

# Bundle app source
COPY . .

# Trim the fat
RUN apt-get purge -y ${BUILD_DEPS} \
    && apt-get autoremove -y 

EXPOSE 8080
ENV NODE_ENV=production

CMD ["npm", "start"]
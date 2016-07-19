FROM nodesource/nsolid:v1.4.0

MAINTAINER Joe McCann <joe@nodesource.com>

# Set some environment variables
ENV APP_DIR=/opt/app \
    PATH=$APP_DIR/node_modules/.bin:$PATH 

# Install our dependencies (libfontconfig for phantomjs)
RUN apt-get update && apt-get install -y --no-install-recommends \
      bzip2 \
      ca-certificates \
      curl \
      git \
      libfontconfig \
      python-software-properties \
    && rm -rf /var/lib/apt/lists/*

# Get latest version of npm for fsevents module (npm 2 fails)
RUN npm install npm -g \
    && npm config set unsafe-perm true \ 
    && git clone https://github.com/joemccann/dillinger ${APP_DIR} 

RUN cd ${APP_DIR} \
    && git checkout master \
    && rm -rf .git \
    && mkdir -p downloads/files/{md,html,pdf} 

# deps.json only has the dependencies from the package.json.
COPY deps.json ${APP_DIR}/package.json

# Docker will use the cache until the dependencies in the package.json have changed
RUN cd ${APP_DIR} \
    && npm install --production 

# This line will bust the cache when anything changes, but the copies are quick
COPY package.json ${APP_DIR}/package.json

# Copy all the css and js from gulp build (gulp build is done outside docker build)
COPY public/css/app.css /${APP_DIR}/public/css/app.css
COPY public/js/bundle.js ${APP_DIR}/public/js/bundle.js

# Trim the fat
RUN apt-get purge -y ${BUILD_DEPS} \
    && apt-get autoremove -y 

WORKDIR ${APP_DIR}
EXPOSE 8080
ENV NODE_ENV=production

CMD ["npm", "start"]
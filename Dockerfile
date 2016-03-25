FROM debian:jessie

ENV NVM_DIR=/opt/nvm \
    APP_DIR=/opt/app
ENV PATH=$APP_DIR/node_modules/.bin:${NVM_DIR}/default/bin:$PATH

COPY npm-shrinkwrap.json /tmp/

RUN apt-get update \
 && GIT_DEPS=' \
      ca-certificates \
      curl \
      git \
    ' \
    DILLINGER_DEPS=' \
      bzip2 \
    ' \
    BUILD_DEPS="${GIT_DEPS} ${DILLINGER_DEPS}" \
    NVM_VERSION=0.30.1 \
    NODE_VERSION=0.11.16 \
    DILLINGER_COMMIT_ID=8c131a04b2384b0e51d3174bec6e97111c4ca967 \
 && apt-get install -y --no-install-recommends ${BUILD_DEPS} \
 && curl https://raw.githubusercontent.com/creationix/nvm/v${NVM_VERSION}/install.sh | bash \
 && . ${NVM_DIR}/nvm.sh \
 && nvm install ${NODE_VERSION} \
 && ln -s ${NVM_DIR}/v${NODE_VERSION} ${NVM_DIR}/default \
 && npm config set unsafe-perm true \
 && git clone https://github.com/joemccann/dillinger ${APP_DIR} \
 && cd ${APP_DIR} \
 && git checkout ${DILLINGER_COMMIT_ID} \
 && rm -rf .git \
 && mv /tmp/npm-shrinkwrap.json ${APP_DIR} \
 && npm install -d \
 && mkdir -p downloads/files/md && mkdir -p downloads/files/html && mkdir -p downloads/files/pdf \
 && npm run predeploy \
 && apt-get purge -y ${BUILD_DEPS} \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

WORKDIR ${APP_DIR}
EXPOSE 8080
ENV NODE_ENV=production

COPY app.js app.js
COPY gulp/tasks/browserSync.js gulp/tasks/browserSync.js
COPY gulp/tasks/webpack.js gulp/tasks/webpack.js
COPY gulp/tasks/uncss.js gulp/tasks/uncss.js
COPY public/scss/vendor/bootstrap-sass-3.2.0/test/test_helper.rb public/scss/vendor/bootstrap-sass-3.2.0/test/test_helper.rb

ENTRYPOINT ["node", "app"]

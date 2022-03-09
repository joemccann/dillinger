FROM node:14.19.0

# # Install our dependencies (libfontconfig for phantomjs)
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y --no-install-recommends \
  bzip2 \
  ca-certificates \
  curl \
  git \
  wget \
  python2.7 \
  build-essential

RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2
RUN tar xvjf phantomjs-1.9.8-linux-x86_64.tar.bz2
ENV PATH=$PATH:/phantomjs-1.9.8-linux-x86_64/bin
ENV OPENSSL_CONF=/etc/ssl


RUN npm install --global gulp-cli@^2.3.0


USER node

WORKDIR /dillinger


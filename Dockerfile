# Dillinger Docker File
#
# Installs dillinger on a container
#
# VERSION  0.0.0
FROM ubuntu:14.04
MAINTAINER Nuno Job "nunojobpinto@gmail.com"
MAINTAINER Casey Bisson "casey.bisson@gmail.com"

#
# update apt
#
RUN apt-get update -q

#
# base dependencies
#
RUN apt-get install -yq \
    build-essential \
    npm \
    chrpath \
    git-core \
    libssl-dev \
    libfontconfig1-dev \
    curl \
    xvfb \
    gtk2-engines-pixbuf \
    x11-xkb-utils \
    xfonts-75dpi \
    xfonts-100dpi \
    xfonts-cyrillic \
    xfonts-scalable \
    libqt4-dev \
    libqtwebkit-dev \
    qt4-qmake \
    python-qt4

#
# symlink `node` to `nodejs`, so annoying
#
RUN command -v node >/dev/null 2>&1 || { ln -s /usr/bin/nodejs /usr/bin/node; }

#
# install global node modules
#
RUN npm install -g gulp forever

#
# install the node dependencies for our node server app
# using caching suggestions per http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
#
ADD ./package.json /tmp/package.json
RUN cd /tmp && \
    npm install

#
# application environment variables
# change the port here and elsewhere
#
ENV PORT=80
ENV NODE_ENV=production

#
# install the app
#
RUN mkdir -p \
    /opt/install/dillinger && \
    mkdir -p /opt/install/dillinger/public/files/{md,html,pdf} && \
    mv /tmp/node_modules /opt/install/dillinger/.
ADD . /opt/install/dillinger
RUN cd /opt/install/dillinger && \
    gulp build --prod

#
# running on port 80
# change the port here and elsewhere
#
expose 80

#
# light this candle
#
CMD ["forever", "/opt/install/dillinger/app.js"]

#
# `docker build` example:
# sudo docker build -t joemccann/dillinger .
#
# `docker run` example:
# docker run -d -p 80:80 joemccann/dillinger
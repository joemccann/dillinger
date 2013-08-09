# Dillinger Docker File
#
# Installs dillinger on a container
#
# VERSION  0.0.0
from       ubuntu
maintainer Nuno Job "nunojobpinto@gmail.com"

#
# update apr
#
run echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list

run apt-get upgrade
run apt-get update

#
# base dependencies
#
run apt-get install -y build-essential chrpath git-core libssl-dev libfontconfig1-dev

#
# install node
#
run cd /usr/local && curl http://nodejs.org/dist/v0.10.15/node-v0.10.15-linux-x64.tar.gz | tar --strip-components=1 -zxf- && cd
run npm -g update npm
run npm install -g forever

#
# install phantomjs
#
run mkdir -p /opt/install/phantomjs
run cd /opt/install && git clone git://github.com/ariya/phantomjs.git
run cd phantomjs && git checkout 1.9 && ./build.sh

#
# install the app
#
run mkdir -p /opt/install/dillinger
add . /opt/install/dillinger
run cd /opt/install/dillinger && npm install

#
# port 8080 exposed by default, can be overriden with -p machine:container
#
expose 8080

#
# how to do docker run
#
cmd forever /opt/install/dillinger/app.js
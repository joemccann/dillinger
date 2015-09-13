# Dillinger Docker File
#
# Installs dillinger on a container
#
# VERSION  0.0.0
FROM nodesource/node:0.12
MAINTAINER Nuno Job "nunojobpinto@gmail.com"
MAINTAINER Casey Bisson "casey.bisson@gmail.com"
MAINTAINER William Blankenship "william.jblankenship@gmail.com"

#
# install the node dependencies for our node server app
# using caching suggestions per http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
#
ADD package.json package.json
RUN NODE_ENV=dev npm install

#
# install the app
#
ADD . .
RUN npm run predeploy

#
# running on port 80
# change the port here and elsewhere
#
EXPOSE 80

#
# application environment variables
# change the port here and elsewhere
#
ENV PORT=80
ENV NODE_ENV=production

#
# light this candle
#
CMD ["node", "app.js"]

#
# `docker build` example:
# sudo docker build -t joemccann/dillinger .
#
# `docker run` example:
# docker run -d -p 80:80 joemccann/dillinger

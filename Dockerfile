# Dillinger Docker File
#
# Installs dillinger on a container
#
# VERSION  1.0.0

FROM nodesource/nsolid-node	
MAINTAINER Joe McCann "joe@nodesource.com"
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
CMD ["nsolid", "app.js"]

#
# `docker build` example:
# sudo docker build -t joemccann/dillinger .
#
# `docker run` example:
# docker run -d -p 80:80 --restart="always" joemccann/dillinger

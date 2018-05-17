FROM m03geek/opencv-node:alpine
# install sharp
RUN apk update && apk add -u --no-cache python make g++
RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
WORKDIR /app
COPY ./package.json /app
RUN npm i -g nodemon && npm i
COPY . /app
CMD ["nodemon","-L", "index.js"]


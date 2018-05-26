# FROM m03geek/opencv-node:alpine
# # install sharp
# RUN apk update && apk add -u --no-cache python make g++
# RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
# WORKDIR /app
# COPY ./package.json /app
# RUN npm i -g nodemon
# RUN npm i -g yarn
# RUN yarn
# COPY . /app
# CMD ["nodemon","-L", "index.js"]

FROM mhart/alpine-node:8.11.2 as nodebase

FROM m03geek/opencv:alpine
ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1

COPY --from=nodebase /usr/bin/node /usr/bin/
COPY --from=nodebase /usr/lib/node_modules /usr/lib/node_modules
COPY --from=nodebase /usr/include/* /usr/include/

RUN ln -s /usr/lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm \
  && ln -s /usr/lib/node_modules/npm/bin/npx-cli.js /usr/bin/npx \
  && rm -rf /usr/local/lib && ln -s /usr/local/lib64 /usr/local/lib \
  && rm /usr/lib/node_modules/npm/*.md

  # install sharp
RUN apk update && apk add -u --no-cache python make g++
RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
WORKDIR /app
COPY ./package.json /app
RUN npm install -g npm@5.6.0
RUN npm i -g nodemon
RUN npm i -g yarn
RUN yarn
COPY . /app
CMD ["nodemon","-L", "index.js"]
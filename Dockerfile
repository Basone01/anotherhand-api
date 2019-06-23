FROM justadudewhohacks/opencv-nodejs 

RUN apt-get update  -y  && apt-get upgrade  -y   && apt-get install -y nodejs  python g++ cmake make git
RUN apt install curl &&  curl -sL https://deb.nodesource.com/setup_8.x |  bash - &&  apt install nodejs
COPY . /app/
WORKDIR /app/
RUN npm uninstall opencv4nodejs
RUN npm install
ENV NODE_PATH=/usr/lib/node_modules





# # FROM m03geek/opencv-node:alpine
# # # install sharp
# # RUN apk update && apk add -u --no-cache python make g++
# # RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
# # WORKDIR /app
# # COPY ./package.json /app
# # RUN npm i -g nodemon
# # RUN npm i -g yarn
# # RUN yarn
# # COPY . /app
# # CMD ["nodemon","-L", "index.js"]

# FROM mhart/alpine-node:8.11.2 as nodebase

# FROM m03geek/opencv:alpine
# ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1

# COPY --from=nodebase /usr/bin/node /usr/bin/
# COPY --from=nodebase /usr/lib/node_modules /usr/lib/node_modules
# COPY --from=nodebase /usr/include/* /usr/include/

# RUN ln -s /usr/lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm \
#   && ln -s /usr/lib/node_modules/npm/bin/npx-cli.js /usr/bin/npx \
#   && rm -rf /usr/local/lib && ln -s /usr/local/lib64 /usr/local/lib \
#   && rm /usr/lib/node_modules/npm/*.md

# # RUN apk update && apk add -u --no-cache python make g++ 

# # RUN apk add vips-dev fftw-dev build-base --update-cache \
# #     --repository https://alpine.global.ssl.fastly.net/alpine/edge/testing/ \
# #     --repository https://alpine.global.ssl.fastly.net/alpine/edge/main \

# RUN npm i -g nodemon \
#   && npm i -g yarn
# WORKDIR /app
# COPY ./package.json /app
# COPY . /app
# RUN yarn
# CMD ["nodemon","-L", "index.js"]


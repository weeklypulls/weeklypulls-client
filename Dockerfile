FROM node:10-alpine
RUN npm install -g yarn

COPY package.json /
COPY yarn.lock /
RUN yarn install \
    && yarn cache clean

COPY . /
CMD [ "yarn", "start"]

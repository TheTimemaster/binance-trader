FROM node:lts-buster
RUN mkdir trader
WORKDIR trader
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
RUN ./node_modules/.bin/tsc
EXPOSE 3000
CMD npm run scheduled


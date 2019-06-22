FROM alpine as buildenv

RUN apk update && apk upgrade
RUN apk add nodejs npm python make g++

ENV NODE_ENV production

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . .
RUN npm run build

FROM nginx
COPY --from=buildenv /app/build /usr/share/nginx/html

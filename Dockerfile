FROM alpine as buildenv

RUN apk update && apk upgrade
RUN apk add nodejs npm python make g++

WORKDIR /app
COPY . .

ENV NODE_ENV production

RUN npm install && npm run build

FROM nginx
COPY --from=buildenv /app/build /usr/share/nginx/html

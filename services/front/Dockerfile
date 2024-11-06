FROM node:23-alpine AS build

ARG VITE_API_ORIGIN
ARG VITE_WS_ORIGIN

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npx prettier . --check
RUN npm run lint
RUN npx vitest run

ENV VITE_API_ORIGIN=$VITE_API_ORIGIN
ENV VITE_WS_ORIGIN=$VITE_WS_ORIGIN

RUN npm run build

FROM caddy:2.8.4-alpine

COPY --from=build /app/dist /app/dist

ENTRYPOINT ["caddy"]
CMD ["file-server", "--root", "/app/dist"]

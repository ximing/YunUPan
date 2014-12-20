FROM node:20-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --omit=dev --prefix server
COPY server ./server
COPY OurEDA.YunPan.Localhost ./OurEDA.YunPan.Localhost
ENV NODE_ENV=production PORT=3010
EXPOSE 3010
CMD ["node", "server/src/index.js"]

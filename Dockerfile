FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts/prepare-browser-assets.mjs ./scripts/prepare-browser-assets.mjs
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DB_DRIVER=mysql
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --from=build --chown=node:node /app/lib ./lib
COPY --from=build --chown=node:node /app/database ./database
COPY --from=build --chown=node:node /app/.runtime ./.runtime
COPY --from=build --chown=node:node /app/next.config.mjs ./
RUN mkdir -p /data/imports /data/profile-photos && chown -R node:node /data
ENV IMPORT_PATH=/data/imports
ENV PROFILE_PHOTO_PATH=/data/profile-photos
ENV ACADEMIC_CONTENT_PATH=/data/academic-content.json
VOLUME ["/data"]
USER node
EXPOSE 3000
CMD ["npm", "start"]

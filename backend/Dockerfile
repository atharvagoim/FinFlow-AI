FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --workspace=backend --omit=optional

FROM base AS build
COPY backend ./backend
RUN npm run build --workspace=backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./package.json
EXPOSE 5000
CMD ["node", "dist/server.js"]

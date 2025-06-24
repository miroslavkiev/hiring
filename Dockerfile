FROM node:18-slim AS build
WORKDIR /app
# Install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci
# Copy source
COPY backend/tsconfig.json ./
COPY backend/src ./src
# Build the TypeScript project
RUN npm run build

FROM node:18-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]

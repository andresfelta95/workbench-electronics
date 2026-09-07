# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# pnpm is pinned to match packageManager in package.json; letting corepack pick
# a version pulls one that needs a newer Node than this image has.
RUN npm install -g pnpm@9.15.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- serve ----------------------------------------------------------------
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/electronics/browser /usr/share/nginx/html
EXPOSE 80

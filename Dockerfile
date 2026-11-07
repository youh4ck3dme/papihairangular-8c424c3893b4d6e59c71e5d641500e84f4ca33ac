# PAPI HAIR DESIGN – statický web (Angular prerendering) servovaný cez nginx.

# 1) build
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# environment súbory (len verejné hodnoty) + sitemap + build + 404.html + predkomprimované .gz/.br
RUN node scripts/ensure-env.mjs && pnpm run build:vps

# 2) nginx
FROM nginx:alpine
COPY --from=build /app/dist/app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

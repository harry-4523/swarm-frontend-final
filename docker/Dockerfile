# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* .
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_USE_MOCK
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_USE_MOCK=${VITE_USE_MOCK}

RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

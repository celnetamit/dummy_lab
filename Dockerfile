FROM node:22-bullseye-slim

# Install OpenSSL (required by Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Accept build argument for which app to build (default to main_web)
ARG APP_NAME=main_web
ENV APP_NAME=${APP_NAME}

# Force completely fresh layer exports to bypass containerd lock on the host
RUN echo "Cache bust: 6" > /tmp/bustcache

# Combine COPY and INSTALL into one layer to prevent containerd export deadlocks
COPY . .

# Install, Generate, Build, and Cleanup Cache in a single step to minimize layer creation
RUN npm install && \
    if [ "$APP_NAME" = "main_web" ]; then cd main_web && npx prisma generate && cd ..; fi && \
    npm run build --workspace=${APP_NAME} && \
    if [ -d "${APP_NAME}/.next/cache" ]; then rm -rf ${APP_NAME}/.next/cache; fi

# Expose the default Coolify port
EXPOSE 3000

# Start the specific application on port 3000
CMD sh -c "if [ \"$APP_NAME\" = \"main_web\" ]; then cd main_web && npx prisma db push && node prisma/seed.js && cd ..; fi && npm run start --workspace=${APP_NAME} -- -p 3000"

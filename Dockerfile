FROM node:22-alpine

# Set working directory
WORKDIR /app

# Accept build argument for which app to build (default to main_web)
ARG APP_NAME=main_web
ENV APP_NAME=${APP_NAME}

# Copy root files
COPY package.json package-lock.json* ./

# Copy all project directories
COPY main_web ./main_web
COPY project_1 ./project_1
COPY project_2 ./project_2
COPY project_3 ./project_3

# Install dependencies for the monorepo
RUN npm install

# Generate Prisma Client (only needed for main_web)
RUN if [ "$APP_NAME" = "main_web" ]; then cd main_web && npx prisma generate; fi

# Build the specific application
RUN npm run build --workspace=${APP_NAME}

# Expose the default Coolify port
EXPOSE 3000

# Start the specific application on port 3000
CMD sh -c "npm run start --workspace=${APP_NAME} -- -p 3000"

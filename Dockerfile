# Stage 1: Build the frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build   # builds 'dist/' folder

# Stage 2: Serve with 'serve'
FROM node:20-alpine

WORKDIR /app

# Install 'serve' globally
RUN npm install -g serve

# Copy built frontend from previous stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 5173

# Run 'serve' to host the static files
CMD ["serve", "-s", "dist", "-l", "5173"]

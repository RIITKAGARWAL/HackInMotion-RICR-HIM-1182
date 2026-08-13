FROM node:18-alpine

WORKDIR /app

# Copy package files and install all dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy source code
COPY backend/ ./backend/
COPY Frontend/ ./Frontend/

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "server.js"]
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 \
    libgbm1 libpango-1.0-0 libcairo2 libasound2 libxshmfence1 \
    libx11-xcb1 libxcb1 libxext6 libxfixes3 libxi6 libxrender1 \
    libxtst6 libglib2.0-0 libdbus-1-3 \
    fonts-noto-cjk fonts-noto-color-emoji fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package.json ./server/
RUN cd server && npm install --omit=dev
RUN cd server && npx playwright install chromium

COPY client/package.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

COPY server/ ./server/
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
RUN mkdir -p /app/server/data-seed /app/server/uploads
COPY seed-db.sqlite /app/server/data-seed/fb-autoposter.db

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

ENTRYPOINT ["/app/entrypoint.sh"]

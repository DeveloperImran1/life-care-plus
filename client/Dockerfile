FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Next.js বিল্ড (প্রোডাকশনের জন্য হলে)
# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
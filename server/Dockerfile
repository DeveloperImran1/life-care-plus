FROM node:20-alpine

WORKDIR /app

# Dependency install
COPY package*.json ./
RUN npm install

# Prisma Client Generate
COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

#  Application Build
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "dev"]
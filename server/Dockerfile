# /server/Dockerfile
FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG DATABASE_URL="postgresql://postgres:123456@db:5432/life_care_plus"
ENV DATABASE_URL=$DATABASE_URL

RUN npm run prisma:generate

EXPOSE 5000

CMD ["npm", "run", "dev"]
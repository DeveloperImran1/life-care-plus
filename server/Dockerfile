FROM node:20

WORKDIR /app

# First copy everything
COPY . .

# Set a dummy DATABASE_URL for Prisma generation during build
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL

# Install dependencies
RUN npm install

# Generate prisma client
RUN npx prisma generate --schema=./prisma/schema

# Build app
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "dev"]
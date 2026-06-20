# Usando versão do node 22-alpine como imagem base
FROM node:22-alpine
# Cria a pasta app dentro do docker, copia e roda o programa dentro dela
WORKDIR /app

# Instala o OpenSSL dependência obrigatória do Prisma no Alpine
RUN apk add --no-cache openssl

# Copia package.json e package-lock.json se precisar, prisma também
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências do programa/node
RUN npm install

# Gera o cliente prisma
RUN npx prisma generate

# Copia o resto do programa dentro do container
COPY . .

# Porta da API
EXPOSE 3333

# Roda o programa
CMD [ "npm", "run", "dev" ]


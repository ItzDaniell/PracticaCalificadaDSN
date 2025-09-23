FROM node:14-alpine

RUN git clone https://github.com/ItzDaniell/PracticaCalificadaDSN.git && cd PracticaCalificadaDSN && npm install

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "bin/www"]
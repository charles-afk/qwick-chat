FROM node:17-Alpine
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "run","start"]
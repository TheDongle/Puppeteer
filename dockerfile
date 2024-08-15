FROM thedongle/puppeteer-firefox-node
WORKDIR /app
EXPOSE 3000
CMD [ "node", "index.js" ]
const { join } = require('path');
/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  defaultBrowser: "firefox",
  chrome: {
    skipDownload: true,
  },
  "chrome-headless-shell": {
    skipDownload: true,
  },
  firefox: {
    skipDownload: false,
  },
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
import puppeteer from "puppeteer";
import { KnownDevices } from "puppeteer";
import fp from "fastify-plugin";

const DEFAULTDEVICE = "iPhone 15";

class PuppeteerInstance {
  constructor(options = {}) {
    this.deviceEmulation = options.deviceEmulation !== false;
    this.device = KnownDevices[options.device] ?? KnownDevices[DEFAULTDEVICE];
    this.browser = {};
    this.page = {};
  }
  async openBrowser() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    if (this.deviceEmulation === true) {
      await this.page.emulate(this.device);
    }
  }
  async scrapeSite(url) {
    if (!this.browser.connected === true) {
      await this.openBrowser();
    }
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    return await this.page.content();
  }
  async closeBrowser() {
    if (this.browser.connected === true) {
      await this.browser.close();
    }
  }
}

/**
 * @param {object} options
 * @param {boolean} options.deviceEmulation Enable phone/tablet emulation. Default is true.
 * @param {string} options.device Device to emulate. Must be key for Puppeteer KnownDevices. Default is iphone 15.
 */
async function PuppeteerFactory(options = {}) {
  const instance = new PuppeteerInstance(options);
  await instance.openBrowser();
  return instance;
}

function fastifyPuppeteer(fastify, options, done) {
  const instance = new PuppeteerInstance(options);

  if (!fastify.puppeteer) {
    fastify.decorate("puppeteer", instance);
  }

  fastify.addHook("onReady", (fastify, done) => instance.openBrowser().then(done).catch(done));

  fastify.addHook("onClose", (fastify, done) => instance.closeBrowser().then(done).catch(done));

  done();
}

export { DEFAULTDEVICE, PuppeteerFactory, PuppeteerInstance };
export default fp(fastifyPuppeteer, { name: "fastify-puppeteer" });

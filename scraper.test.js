import { PuppeteerFactory, PuppeteerInstance, DEFAULTDEVICE } from "./scraper.js";
import { expect, jest, test } from "@jest/globals";
import puppeteer, { KnownDevices, Page, Browser } from "puppeteer";


describe("Puppeteer", () => {
  test("Firefox is default browser", () => {
    expect(puppeteer.defaultBrowser).toBe("firefox")
  })
})

describe("PuppeteerInstance Initialisation", () => {
  describe("Default Options", () => {
    it("Should exist", () => {
      const instance = new PuppeteerInstance();
      expect(instance).toBeDefined();
    });
    it.each([
      ["device", KnownDevices["iPhone 15"]],
      ["deviceEmulation", true],
      ["browser", {}],
      ["page", {}],
    ])("Property %s and default value %s", (property, defaultValue) => {
      const instance = new PuppeteerInstance();
      expect(instance).toHaveProperty(property, defaultValue);
    });
  });
  describe("Custom Options", () => {
    it("should allow 'deviceEmulation' to be set to 'false'", () => {
      const instance = new PuppeteerInstance({ deviceEmulation: false });
      expect(instance).toHaveProperty("deviceEmulation", false);
    });
    it.each(["", null, 0, "hello"])(
      "invalid deviceEmulation value '%s' should be coerced to 'true",
      value => {
        const instance = new PuppeteerInstance({ deviceEmulation: value });
        expect(instance).toHaveProperty("deviceEmulation", true);
      },
    );
    it("should allow 'device' to be set to another entry in puppeteer's KnownDevices", () => {
      const instance = new PuppeteerInstance({ device: "iPhone 13" });
      expect(instance).toHaveProperty("device", KnownDevices["iPhone 13"]);
    });
    it.each(["", null, 0, "fakephone", false])(
      "invalid device value '%s' should be coerced to the default device",
      value => {
        const expected = KnownDevices[DEFAULTDEVICE];
        const instance = new PuppeteerInstance({ device: value });
        expect(instance).toHaveProperty("device", expected);
      },
    );
  });
});

describe("Managing Browsers", () => {
  let instance;
  beforeAll(async () => {
    instance = new PuppeteerInstance();
    await instance.openBrowser();
  });
  describe("openbrowser Method", () => {
    it("Should result in a valid browser property", () => {
      expect(instance.browser).toBeInstanceOf(Browser);
    });
    it("Should have a browser which is connected", () => {
      expect(instance.browser).toHaveProperty("connected", true);
    });
    it("Should have a valid page property", () => {
      expect(instance.page).toBeInstanceOf(Page);
    });
  });
  describe("closeBrowser Method", () => {
    it("Should close the browser", async () => {
      // Browser must first be connected to begin the test
      expect(instance.browser).toHaveProperty("connected", true);
      await instance.closeBrowser();
      expect(instance.browser).toHaveProperty("connected", false);
    });
  });
  afterAll(async () => {
    if (instance.browser.connected === true) {
      await instance.closeBrowser();
    }
  });
});

describe("Scraping", () => {
  describe("No device emulated", () => {
    let puppeteerInstance;
    beforeAll(async () => {
      puppeteerInstance = new PuppeteerInstance({ deviceEmulation: false });
      await puppeteerInstance.openBrowser();
    });
    it("Can scrape Wikipedia", async () => {
      expect(await puppeteerInstance.scrapeSite("https://en.wikipedia.org/wiki/Canada")).toEqual(
        expect.stringContaining("Canada"),
      );
    });
    // it("Cannot scrape how long to beat", async () => {
    //   expect(await puppeteerInstance.scrapeSite("https://howlongtobeat.com/game/68033")).toEqual(
    //     expect.stringContaining("Unavailable"),
    //   );
    // });
    afterAll(async () => {
      if (puppeteerInstance.browser.connected === true) {
        await puppeteerInstance.closeBrowser();
      }
    });
  });
  describe("Devices emulated", () => {
    it.each(["iPhone 13", "iPhone 15", "iPhone 14"])(
      `Can scrape how long to beat when emulating %s`,
      async deviceName => {
        const instance = new PuppeteerInstance({ device: deviceName });
        await instance.openBrowser();
        expect(instance.device).toBe(KnownDevices[deviceName]);
        const info = await instance.scrapeSite("https://howlongtobeat.com/game/2127");
        expect(info).not.toEqual(expect.stringContaining("Unavailable"));
        expect(info).toEqual(expect.stringContaining("Cyberpunk 2077"));
        if (instance.browser.connected === true) {
          await instance.closeBrowser();
        }
      },
    );
  });
});

// describe("Puppeteer Factory", () => {
//   let factoryMade, manual;
//   beforeAll(async () => {
//     factoryMade = await PuppeteerFactory();
//     manual = new PuppeteerInstance();
//     await manual.openBrowser();
//   });
//   it("Should return a Puppeteer instance with pre-connected browser", async () => {
//     expect(factoryMade).toBeInstanceOf(PuppeteerInstance);
//     expect(factoryMade).toStrictEqual(manual);
//   });
//   afterAll(async () => {
//     [manual, factoryMade].forEach(async instance => {
//       if (instance.browser.connected === true) {
//         await instance.closeBrowser();
//       }
//     });
//   });
// });

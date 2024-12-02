const { chromium } = require("playwright");
const fs = require("fs");
const { performance } = require("perf_hooks");

(async () => {
  const scrapeObituaryNotices = async (page) => {
    try {
      const pElements = await page.$$eval("p", (elements) =>
        elements.map((el) =>
          el.textContent.replace(/&nbsp;|\u200b/g, " ").trim()
        )
      );

      const outputFile = "obituary_notices.txt";
      const fileHandle = await fs.promises.open(outputFile, "a");

      await fileHandle.write(`Obituary Notice section 2\n`);
      if (pElements.length > 0) {
        pElements.forEach((pText, index) => {
          if (pText) {
            fileHandle.write(`Obituary Notice ${index + 1}: ${pText}\n`);
          }
        });
        console.log(
          "Obituary notices have been written to 'obituary_notices.txt'."
        );
      } else {
        await fileHandle.write("No obituary notices found.\n");
        console.log("No obituary notices found.");
      }

      await fileHandle.close();
    } catch (error) {
      console.error(
        "An error occurred while trying to locate <p> elements:",
        error
      );
    }
  };

  const openTheWebsite = async (page) => {
    try {
      await page.goto(
        "https://reserved767.rssing.com/chan-65241722/all_p1.html"
      );

      const consentButtonSelector = "button:has-text('AGREE')";
      const consentButton = await page.$(consentButtonSelector);
      if (consentButton) {
        await consentButton.click();
      }
    } catch (error) {
      console.error(
        "An error occurred while trying to close the consent banner:",
        error
      );
    }
  };

  const readObituaryNotices2 = async () => {
    const startTime = performance.now();
    const browser = await chromium.launch({ headless: true, slowMo: 10 });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await openTheWebsite(page);
      await scrapeObituaryNotices(page);
    } catch (error) {
      console.error("Error during the scraping process:", error);
    } finally {
      await browser.close();
    }
    const endTime = performance.now();
    console.log(`Execution Time: ${(endTime - startTime).toFixed(2)}ms`);
  };

  readObituaryNotices2();
})();

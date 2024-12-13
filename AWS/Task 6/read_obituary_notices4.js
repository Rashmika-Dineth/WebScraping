const { chromium } = require("playwright");
const fs = require("fs");

module.exports = async function readObituaryNotices4() {
  console.log("Loading site 4");
  const slowMo = 100; // Slow down actions to simulate user-like interaction
  const headless = true; // Run in headless mode

  // Open browser and page
  const browser = await chromium.launch({ headless, slowMo });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await openTheWebsite(page);
    await scrapeObituaryNotices(page);
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  } finally {
    // Close browser
    await browser.close();
  }

  async function openTheWebsite(page) {
    const url =
      "https://www.dailynews.lk/2024/10/21/obituaries/657697/obituaries-332/";
    console.log(`Navigating to: ${url}`);
    await page.goto(url);

    const consentButtonSelector = `button:has-text("Consent")`;

    try {
      // Wait for the consent button and click it
      await page.waitForSelector(consentButtonSelector, { timeout: 5000 });
      const consentButton = await page.$(consentButtonSelector);

      if (consentButton) {
        await consentButton.click();
        // console.log("Consent banner closed.");
      } else {
        // console.log("No consent banner found.");
      }
    } catch (error) {
      console.warn("Consent banner handling error or timeout:", error);
    }
  }

  async function scrapeObituaryNotices(page) {
    const obituarySelector = "div.inner-post-entry p";

    try {
      // Wait for the obituary content to be available
      await page.waitForSelector(obituarySelector, { timeout: 5000 });
      const pElements = await page.$$(obituarySelector);

      const filePath = "obituary_notices.txt";
      const notices = [];

      if (pElements.length > 0) {
        for (const [index, pElement] of pElements.entries()) {
          const pText = (await pElement.innerText())
            .replace(/&nbsp;/g, " ")
            .replace(/\u200b/g, "")
            .replace(/\ufeff/g, "")
            .trim();

          if (pText) {
            const notice = `Obituary Notice ${index + 1}: ${pText}`;
            notices.push(notice);
            // console.log(notice);
          }
        }

        fs.writeFileSync(
          filePath,
          `Obituary Notice section 4\n${notices.join("\n")}\n`,
          { flag: "a" }
        );
        // console.log(`Obituary notices have been written to '${filePath}'.`);
      } else {
        // console.log("No obituary notices found.");
        fs.writeFileSync(filePath, "No obituary notices found.\n", {
          flag: "a",
        });
      }
    } catch (error) {
      console.error(
        "An error occurred while scraping obituary notices:",
        error
      );
    }
  }
};

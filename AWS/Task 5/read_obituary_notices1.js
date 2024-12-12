const fs = require("fs");
const playwright = require("playwright");

module.exports = async function read_obituary_notices1() {
  console.log("Loading site 1");
  // console.log("Starting the scraper...");
  const browser = await playwright.chromium.launch({
    headless: true,
    slowMo: 10,
  });
  const page = await browser.newPage();

  try {
    await open_the_website(page);
    await scrape_all_pages(page);
  } catch (error) {
    console.error(`Error during scraping: ${error.message}`);
  } finally {
    await browser.close();
    // console.log("Browser closed.");
  }
};

async function open_the_website(page) {
  try {
    await page.goto("https://www.elanka.com.au/obituaries/");

    const consentButtonSelector =
      "button:has-text('Accept'), button:has-text('agree'), button:has-text('Consent')";
    const consentButton = await page.$(consentButtonSelector);

    if (consentButton) {
      await consentButton.click();
    } else {
      // console.log("No consent banner found.");
    }
  } catch (error) {
    console.error(`Error closing consent banner: ${error.message}`);
  }
}

function clean_text(text) {
  return text.replace(/&nbsp;|\u200b/g, " ").trim();
}

async function scrape_all_pages(page) {
  const outputFile = "obituary_notices.txt";
  const fileStream = fs.createWriteStream(outputFile, { flags: "w" });
  let pageNumber = 1;

  try {
    while (true) {
      // console.log(`Scraping page ${pageNumber}...`);
      await scrape_obituary_notices(page, fileStream);

      const nextButtonSelector = "a:has-text('Next'), button:has-text('Next')";
      const nextButton = await page.$(nextButtonSelector);

      if (nextButton) {
        process.stdout.write(".");
        // console.log("Navigating to the next page...");
        await nextButton.click();
        await page.waitForLoadState("domcontentloaded");
        pageNumber++;
      } else {
        // console.log("No more pages to scrape.");
        console.log("");
        break;
      }
    }

    // console.log(`All obituary notices have been saved to '${outputFile}'.`);
  } catch (error) {
    console.error(`Error during pagination: ${error.message}`);
  } finally {
    fileStream.end();
  }
}

async function scrape_obituary_notices(page, fileStream) {
  try {
    const h2Elements = await page.$$("h2.pld-post-title");

    if (h2Elements.length > 0) {
      for (let i = 0; i < h2Elements.length; i++) {
        const h2 = h2Elements[i];
        const h2Text = clean_text(await h2.innerText()).replace("\ufeff", "");

        // console.log(`Obituary Notice ${i + 1}: ${h2Text}`);
        fileStream.write(`Obituary Notice ${i + 1}: ${h2Text}\n`);
      }
    } else {
      // console.log("No obituary notices found on this page.");
      fileStream.write("No obituary notices found on this page.\n");
    }
  } catch (error) {
    console.error(
      `Error scraping obituaries on the current page: ${error.message}`
    );
  }
}

// Execution Time: 48771.96ms

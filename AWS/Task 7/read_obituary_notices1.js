const fs = require("fs");
const playwright = require("playwright");

module.exports = async function read_obituary_notices1() {
  console.log("Loading site 1");

  const browser = await playwright.chromium.launch({
    headless: true,
    slowMo: 10,
  });
  const page = await browser.newPage();

  // 🚫 Block Google Ads and other trackers
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (
      url.includes("googlesyndication.com") ||
      url.includes("doubleclick.net") ||
      url.includes("googleads") ||
      url.includes("adservice")
    ) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    await open_the_website(page);
    await scrape_all_pages(page);
  } catch (error) {
    console.error(`Error during scraping: ${error.message}`);
  } finally {
    await browser.close();
  }
};

async function open_the_website(page) {
  try {
    await page.goto("https://www.elanka.com.au/obituaries/", {
      waitUntil: "domcontentloaded",
    });

    const consentButton = page.locator(
      "button:has-text('Accept'), button:has-text('agree'), button:has-text('Consent')"
    );

    if (await consentButton.count()) {
      await consentButton.first().click({ force: true });
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
      await scrape_obituary_notices(page, fileStream);

      const nextButton = page.locator(
        "a:has-text('Next'), button:has-text('Next')"
      );

      if (await nextButton.count()) {
        process.stdout.write(".");
        await nextButton.first().click({ force: true });
        await page.waitForLoadState("domcontentloaded");
        pageNumber++;
      } else {
        console.log("\nNo more pages to scrape.");
        break;
      }
    }

    console.log(`All obituary notices saved to '${outputFile}'.`);
  } catch (error) {
    console.error(`Error during pagination: ${error.message}`);
  } finally {
    fileStream.end();
  }
}

async function scrape_obituary_notices(page, fileStream) {
  try {
    const h2Elements = await page.locator("h2.pld-post-title");
    const count = await h2Elements.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const h2Text = clean_text(await h2Elements.nth(i).innerText()).replace(
          "\ufeff",
          ""
        );
        fileStream.write(`Obituary Notice ${i + 1}: ${h2Text}\n`);
      }
    } else {
      fileStream.write("No obituary notices found on this page.\n");
    }
  } catch (error) {
    console.error(
      `Error scraping obituaries on the current page: ${error.message}`
    );
  }
}


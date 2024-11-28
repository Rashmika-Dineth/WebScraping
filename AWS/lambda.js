const playwrightAWS = require("playwright-aws-lambda");

(async () => {
  const event = { url: "https://www.elanka.com.au/obituaries/" };
  const { page, browser } = await open_web_page(event);
  await get_page_content(page, browser);
})();

async function open_web_page(event) {
  let browser = null;

  try {
    browser = await playwrightAWS.launchChromium();
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = event?.url;
    await page.goto(url);
    const title = await page.title();

    // Handle the consent button if it exists
    const consentButtonSelector = "button:has-text('Consent')";
    if (await page.$(consentButtonSelector)) {
      await page.click(consentButtonSelector);
    } else {
      console.log("No consent button found.");
    }
    // Return the page and browser for further use
    return { success: true, browser, page };
  } catch (error) {
    console.error("Error during browser automation: ", error);
    return { success: false, error: error.message };
  }
  return page, browser;
}

// Extract content from the page
async function get_page_content(page, browser) {
  try {
    const contentSelector = "div.pld-post-content-inner";
    await page.waitForSelector(contentSelector, { timeout: 5000 });
    scrape_obituary_notices(page, "Sample");
    const content = await page.innerHTML(contentSelector);
    console.log("Page Content:", content);
    return { success: true, content };
  } catch (error) {
    console.error("Error during content extraction: ", error);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function scrape_obituary_notices(page, file) {
  // Scrapes obituary notices from the current page
  try {
    const h2Elements = await page.$$("h2.pld-post-title"); // Select all matching elements

    if (h2Elements.length > 0) {
      for (let i = 0; i < h2Elements.length; i++) {
        const h2 = h2Elements[i];
        const h2Text = (await h2.innerText()).replace("\ufeff", "").trim(); // Clean and format text

        // Log or write the obituary notice
        console.log(`Obituary Notice ${i + 1}: ${h2Text}`);
        if (file) {
          file.write(`Obituary Notice ${i + 1}: ${h2Text}\n`);
        }
      }
    } else {
      console.log("No obituary notices found on this page.");
      if (file) {
        file.write("No obituary notices found on this page.\n");
      }
    }
  } catch (e) {
    console.error(
      `Error scraping obituaries on the current page: ${e.message}`
    );
  }
}

const playwrightAWS = require("playwright-aws-lambda");

(async () => {
  const event = { url: "https://www.elanka.com.au/obituaries/" };
  // await open_web_page(event);
  await get_page_content(event);
})();

async function open_web_page(event) {
  let browser = null;

  try {
    browser = await playwrightAWS.launchChromium();
    const context = await browser.newContext();
    const page = await context.newPage();

    const url = event?.url || "https://www.elanka.com.au/obituaries/";
    await page.goto(url);

    // Log the page title
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
  } finally {
    // Ensure the browser is closed in case of errors
    if (browser) {
      await browser.close();
    }
  }
}

// Extract content from the page
async function get_page_content(event) {
  let browser = null;

  try {
    browser = await playwrightAWS.launchChromium();
    const context = await browser.newContext();
    const page = await context.newPage();

    const url = event?.url || "https://www.elanka.com.au/obituaries/";
    console.log(`Navigating to: ${url}`);
    await page.goto(url);

    const contentSelector = "div.pld-post-content-inner";
    await page.waitForSelector(contentSelector, { timeout: 5000 });

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

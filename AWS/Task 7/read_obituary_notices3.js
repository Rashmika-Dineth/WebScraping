const { chromium } = require("playwright");
const fs = require("fs");

module.exports = async function readObituaryNotices3() {
  console.log("Loading site 3");
  const browser = await chromium.launch({ headless: false, slowMo: 5000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await openTheWebsite(page);
    const links = await loadAllPosts(page);
    await scrapeObituaryNoticesFromLinks(page, links); // Reuse the page to scrape notices
  } catch (error) {
    console.error("An error occurred in the main task:", error);
  } finally {
    await browser.close();
  }
};

// Navigate to the website and handle the consent banner
async function openTheWebsite(page) {
  try {
    await page.goto("https://www.sundayobserver.lk/category/obituaries/");

	await page.click('input[type="checkbox"]');  // Click the checkbox

	// Optionally, check if the checkbox is checked
	const isChecked = await page.isChecked('input[type="checkbox"]');
	console.log(`Is the checkbox checked? ${isChecked}`);

    // Handle consent banner
    const consentButton = page.locator('button[aria-label="Consent"]');
    if (await consentButton.isVisible()) {
      await consentButton.click();
      // console.log("Consent banner closed.");
    }
  } catch (error) {
    console.error(
      "An error occurred while handling the consent banner:",
      error
    );
  }
}

// Click the "Load More Posts" button until all content is loaded
async function loadAllPosts(page) {
  const loadMoreButtonSelector = "a.penci-ajax-more-button";
  const noMorePostsMessageSelector =
    "div.penci-pagination:has-text('Sorry, No more posts')";
  let links = [];

  while (true) {
    try {
      // Check if "No more posts" message is visible
      if (await page.locator(noMorePostsMessageSelector).isVisible()) {
        // console.log("All posts have been loaded. No more posts available.");

        // Extract all <a> links with the text "Obituaries"
        links = await page
          .locator("h2.penci-entry-title.entry-title.grid-title a")
          .evaluateAll((anchors) =>
            anchors
              .filter((anchor) => anchor.textContent.trim() === "Obituaries")
              .map((anchor) => ({ href: anchor.href }))
          );
        return links;
      }

      // Check if the "Load More Posts" button is present and click
      const loadMoreButton = page.locator(loadMoreButtonSelector);
      if (await loadMoreButton.isVisible()) {
        await loadMoreButton.scrollIntoViewIfNeeded();
        await loadMoreButton.click();
        await page.waitForSelector(
          "div.theiaStickySidebar div.item-content p",
          { timeout: 5000 }
        );
      } else {
        // console.log("Load More Posts button not found.");
        break;
      }
    } catch (error) {
      console.error("An error occurred while loading more posts:", error);
      break;
    }
  }
  return links;
}

async function scrapeObituaryNoticesFromLinks(page, links) {
  const allNotices = [];
  let i = 0;
  try {
    for (let link of links) {
      i++;
      console.log(`Navigating to: ${link.href}`);
      await page.goto(link.href);

      const pElements = await page
        .locator("div.inner-post-entry.entry-content p")
        .all();

      // Extract and log text content from each <p> element
      const obituaryNotices = [];
      for (let pElement of pElements) {
        const pText = await pElement.innerText();
        // Clean up the text by trimming and removing unwanted characters
        const cleanedText = pText.trim().replace("\u200b", "");

        if (cleanedText) {
          obituaryNotices.push(cleanedText);
        }
      }

      // Accumulate notices in an array
      if (obituaryNotices.length > 0) {
        allNotices.push(...obituaryNotices);
      }
    }

    // Write all collected notices to a file at once
    if (allNotices.length > 0) {
      const filePath = "obituary_notices.txt";
      const fileStream = fs.createWriteStream(filePath, { flags: "a" });
      fileStream.write(`Obituary Notice section 3 \n`);

      allNotices.forEach((notice, index) => {
        fileStream.write(`Obituary Notice ${index + 1}: ${notice}\n`);
      });

      fileStream.end();
      // console.log(`Obituary notices have been written to '${filePath}'.`);
    } else {
      // console.log("No obituary notices found.");
    }
  } catch (error) {
    console.error("An error occurred while scraping obituary notices:", error);
  }
}

const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  // Main function
  const startTime = performance.now();
  async function readObituaryNotices3() {
    const browser = await chromium.launch({ headless: true, slowMo: 100 });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await openTheWebsite(page);
      await loadAllPosts(page);
      await scrapeObituaryNotices(page);
    } catch (error) {
      console.error("An error occurred in the main task:", error);
    } finally {
      await browser.close();
    }
  }

  // Navigate to the website and handle the consent banner
  async function openTheWebsite(page) {
    try {
      await page.goto("https://www.sundayobserver.lk/category/obituaries/");

      // Handle consent banner
      const consentButton = page.locator('button[aria-label="Consent"]');
      if (await consentButton.isVisible()) {
        await consentButton.click();
        console.log("Consent banner closed.");
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

    while (true) {
      try {
        // Check if "No more posts" message is visible
        if (await page.locator(noMorePostsMessageSelector).isVisible()) {
          console.log("All posts have been loaded. No more posts available.");
          break;
        }

        // Check if the "Load More Posts" button is present
        const loadMoreButton = page.locator(loadMoreButtonSelector);
        if (await loadMoreButton.isVisible()) {
          await loadMoreButton.scrollIntoViewIfNeeded();
          await loadMoreButton.click();
          console.log(
            "Clicked 'Load More Posts'. Waiting for new content to load..."
          );

          // Wait for new content to load
          await page.waitForSelector(
            "div.theiaStickySidebar div.item-content p",
            { timeout: 5000 }
          );
        } else {
          console.log("Load More Posts button not found.");
          break;
        }
      } catch (error) {
        console.error("An error occurred while loading more posts:", error);
        break;
      }
    }
  }

  // Scrape obituary notices and save to a text file
  async function scrapeObituaryNotices(page) {
    try {
      // Wait for obituary notices to be visible
      await page.waitForSelector("div.theiaStickySidebar div.item-content p", {
        timeout: 10000,
      });

      // Find all <p> elements containing obituary notices
      const pElements = await page
        .locator("div.theiaStickySidebar div.item-content p")
        .all();

      // Save the extracted notices to a file
      const filePath = "obituary_notices.txt";
      const fileStream = fs.createWriteStream(filePath, { flags: "a" });
      fileStream.write("Obituary Notice section 3\n");

      if (pElements.length > 0) {
        for (let i = 0; i < pElements.length; i++) {
          const pText = (await pElements[i].innerText())
            .trim()
            .replace("\u200b", "");
          if (pText) {
            fileStream.write(`Obituary Notice ${i + 1}: ${pText}\n`);
            // console.log(`Obituary Notice ${i + 1}: ${pText}`);
          }
        }
        console.log(`Obituary notices have been written to '${filePath}'.`);
      } else {
        fileStream.write("No obituary notices found.\n");
        console.log("No obituary notices found.");
      }
      fileStream.end();
    } catch (error) {
      console.error(
        "An error occurred while scraping obituary notices:",
        error
      );
    }
  }

  // Run the main function
  await readObituaryNotices3();
  // Capture end time and log the execution time
  const endTime = performance.now();
  const executionTime = (endTime - startTime) / 1000; // Convert to seconds
  console.log(`Script executed in ${executionTime.toFixed(2)} seconds.`);
})();

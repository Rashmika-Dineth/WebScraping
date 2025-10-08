package com.example;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.*;
import java.io.FileWriter;
import java.io.IOException;

public class ObituaryScraper {

    public static void main(String[] args) {
        readObituaryNotices1();
    }

    public static void readObituaryNotices1() {
        System.out.println("Loading site 1");

        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(
                    new BrowserType.LaunchOptions()
                            .setHeadless(true)
                            .setSlowMo(10)
            );
            Page page = browser.newPage();

            // 🚫 Block ads and trackers
            page.route("**/*", route -> {
                String url = route.request().url();
                if (url.contains("googlesyndication.com")
                        || url.contains("doubleclick.net")
                        || url.contains("googleads")
                        || url.contains("adservice")) {
                    route.abort();
                } else {
                    route.resume();
                }
            });

            try {
                openWebsite(page);
                scrapeAllPages(page);
            } catch (Exception e) {
                System.err.println("Error during scraping: " + e.getMessage());
            } finally {
                browser.close();
            }

        } catch (Exception e) {
            System.err.println("Playwright failed: " + e.getMessage());
        }
    }

    private static void openWebsite(Page page) {
        try {
            page.navigate("https://www.elanka.com.au/obituaries/", new Page.NavigateOptions()
                    .setWaitUntil(WaitUntilState.DOMCONTENTLOADED));

            Locator consentButton = page.locator("button:has-text('Accept'), button:has-text('agree'), button:has-text('Consent')");

            if (consentButton.count() > 0) {
                consentButton.first().click(new Locator.ClickOptions().setForce(true));
            }

        } catch (Exception e) {
            System.err.println("Error closing consent banner: " + e.getMessage());
        }
    }

    private static void scrapeAllPages(Page page) {
        String outputFile = "obituary_notices.txt";

        try (FileWriter fileWriter = new FileWriter(outputFile)) {
            int pageNumber = 1;

            while (true) {
                scrapeObituaryNotices(page, fileWriter);

                Locator nextButton = page.locator("a:has-text('Next'), button:has-text('Next')");

                if (nextButton.count() > 0) {
                    System.out.print(".");
                    nextButton.first().click(new Locator.ClickOptions().setForce(true));
                    page.waitForLoadState(LoadState.DOMCONTENTLOADED);
                    pageNumber++;
                } else {
                    System.out.println("\nNo more pages to scrape.");
                    break;
                }
            }

            System.out.println("All obituary notices saved to '" + outputFile + "'.");

        } catch (IOException e) {
            System.err.println("File error: " + e.getMessage());
        } catch (PlaywrightException e) {
            System.err.println("Scraping error: " + e.getMessage());
        }
    }

    private static void scrapeObituaryNotices(Page page, FileWriter fileWriter) {
        try {
            Locator h2Elements = page.locator("h2.pld-post-title");
            int count = h2Elements.count();

            if (count > 0) {
                for (int i = 0; i < count; i++) {
                    String h2Text = cleanText(h2Elements.nth(i).innerText()).replace("\ufeff", "");
                    fileWriter.write("Obituary Notice " + (i + 1) + ": " + h2Text + "\n");
                }
            } else {
                fileWriter.write("No obituary notices found on this page.\n");
            }

        } catch (Exception e) {
            System.err.println("Error scraping obituaries on the current page: " + e.getMessage());
        }
    }

    private static String cleanText(String text) {
        return text.replace("\u00a0", " ") // &nbsp;
                   .replace("\u200B", " ") // zero-width space
                   .trim();
    }
}

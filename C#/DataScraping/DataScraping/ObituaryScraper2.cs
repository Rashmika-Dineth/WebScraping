using Microsoft.Playwright;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Xml;
using static System.Net.Mime.MediaTypeNames;

public static class ObituaryScraper2

    {
        public static async Task ReadObituaryNotices2()
        {
            Console.WriteLine("Loading site 2");

            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = true,
                SlowMo = 10
            });

            var context = await browser.NewContextAsync();
            var page = await context.NewPageAsync();

            try
            {
                await OpenTheWebsite(page);
                await ScrapeObituaryNotices(page);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during the scraping process: " + ex.Message);
            }
            finally
            {
                await browser.CloseAsync();
            }
        }

        private static async Task OpenTheWebsite(IPage page)
        {
            try
            {
                await page.GotoAsync("https://reserved767.rssing.com/chan-65241722/all_p1.html");

                var consentButton = await page.QuerySelectorAsync("button:has-text('AGREE')");
                if (consentButton != null)
                {
                    await consentButton.ClickAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred while trying to close the consent banner: " + ex.Message);
            }
        }

        private static async Task ScrapeObituaryNotices(IPage page)
        {
            try
            {
                var pElements = await page.EvalOnSelectorAllAsync<string[]>("p", @"elements => 
                    elements.map(el => el.textContent.replace(/&nbsp;|\u200b/g, ' ').trim())"
                );

                string outputFile = "obituary_notices.txt";

                await using var fileHandle = new StreamWriter(outputFile, append: true);

                await fileHandle.WriteLineAsync("Obituary Notice section 2");

                if (pElements.Length > 0)
                {
                    for (int i = 0; i < pElements.Length; i++)
                    {
                        var pText = pElements[i];
                        if (!string.IsNullOrWhiteSpace(pText))
                        {
                            await fileHandle.WriteLineAsync($"Obituary Notice {i + 1}: {pText}");
                        }
                    }
                }
                else
                {
                    await fileHandle.WriteLineAsync("No obituary notices found.");
                }

                Console.WriteLine($"All obituary notices saved to '{outputFile}'.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred while trying to locate <p> elements: " + ex.Message);
            }
        }
}

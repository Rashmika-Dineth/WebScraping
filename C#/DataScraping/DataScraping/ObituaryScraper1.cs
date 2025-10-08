using Microsoft.Playwright;
using System;
using System.IO;
using System.Threading.Tasks;

public static class ObituaryScraper1
{
    public static async Task ReadObituaryNotices1()
    {
        Console.WriteLine("Loading site 1");

        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
            SlowMo = 12
        });

        var context = await browser.NewContextAsync();
        var page = await context.NewPageAsync();

        // 🚫 Block Google Ads and trackers
        await page.RouteAsync("**/*", async route =>
        {
            var url = route.Request.Url;
            if (url.Contains("googlesyndication.com") ||
                url.Contains("doubleclick.net") ||
                url.Contains("googleads") ||
                url.Contains("adservice"))
            {
                await route.AbortAsync();
            }
            else
            {
                await route.ContinueAsync();
            }
        });

        try
        {
            await OpenTheWebsite(page);
            await ScrapeAllPages(page);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error during scraping: {ex.Message}");
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
            await page.GotoAsync("https://www.elanka.com.au/obituaries/", new PageGotoOptions
            {
                WaitUntil = WaitUntilState.DOMContentLoaded
            });

            var consentButton = page.Locator(
                "button:has-text('Accept'), button:has-text('agree'), button:has-text('Consent')"
            );

            if (await consentButton.CountAsync() > 0)
            {
                await consentButton.First.ClickAsync(new LocatorClickOptions { Force = true });
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error closing consent banner: {ex.Message}");
        }
    }

    private static string CleanText(string text)
    {
        return text.Replace("\u00A0", " ")  // &nbsp;
                   .Replace("\u200b", " ")
                   .Trim();
    }

    private static async Task ScrapeAllPages(IPage page)
    {
        string outputFile = "obituary_notices.txt";
        await using var writer = new StreamWriter(outputFile, append: false);
        int pageNumber = 1;

        try
        {
            while (true)
            {
                await ScrapeObituaryNotices(page, writer);

                var nextButton = page.Locator("a:has-text('Next'), button:has-text('Next')");
                if (await nextButton.CountAsync() > 0)
                {
                    Console.Write(".");
                    await nextButton.First.ClickAsync(new LocatorClickOptions { Force = true });
                    await page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
                    pageNumber++;
                }
                else
                {
                    Console.WriteLine("\nNo more pages to scrape.");
                    break;
                }
            }

            Console.WriteLine($"All obituary notices saved to '{outputFile}'.");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error during pagination: {ex.Message}");
        }
    }

    private static async Task ScrapeObituaryNotices(IPage page, StreamWriter writer)
    {
        try
        {
            var h2Elements = page.Locator("h2.pld-post-title");
            int count = await h2Elements.CountAsync();

            if (count > 0)
            {
                for (int i = 0; i < count; i++)
                {
                    string h2Text = CleanText((await h2Elements.Nth(i).InnerTextAsync()).Replace("\ufeff", ""));
                    await writer.WriteLineAsync($"Obituary Notice {i + 1}: {h2Text}");
                }
            }
            else
            {
                await writer.WriteLineAsync("No obituary notices found on this page.");
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error scraping obituaries on the current page: {ex.Message}");
        }
    }
}

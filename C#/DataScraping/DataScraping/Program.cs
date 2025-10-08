using System;
using System.Diagnostics;
using System.Threading.Tasks;

class Program
{
    public static async Task Main(string[] args)
    {
        var stopwatch = new Stopwatch();
        stopwatch.Start();


    try
        {
            // Run scrapers in order
            await ObituaryScraper1.ReadObituaryNotices1();
            //await ObituaryScraper2.ReadObituaryNotices2();
            // await ObituaryScraper3.ReadObituaryNotices3();
            // await ObituaryScraper4.ReadObituaryNotices4();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("An error occurred: " + ex.Message);
        }

        stopwatch.Stop();
        Console.WriteLine($"Execution Time: {stopwatch.Elapsed.TotalMilliseconds:F2}ms");
    }


}

from robocorp.tasks import task
from robocorp import browser
import re
from datetime import datetime

@task
def read_obituary_notices1():
    """Get obituary notices across multiple pages"""
    browser.configure(slowmo=10, headless=True)
    open_the_website()
    scrape_all_pages()

def open_the_website():
    """Navigates to the given URL and closes the consent banner if present"""
    browser.goto("https://www.elanka.com.au/obituaries/")
    page = browser.page()
    
    try:
        consent_button_selector = "button:has-text('Accept'), button:has-text('agree'), button:has-text('Consent')"
        if page.wait_for_selector(consent_button_selector, timeout=5000):
            page.click(consent_button_selector)
    except Exception as e:
        print(f"Error closing consent banner: {e}")

def clean_text(text):
    """Cleans text by removing unwanted characters and symbols."""
    return re.sub(r"&nbsp;|\u200b", " ", text).strip()

def scrape_all_pages():
    """Scrapes obituary notices across multiple pages and saves them to a file"""
    page = browser.page()
    timestamp = datetime.now().strftime("%Y%m%d")
    output_file = f"obituary_notices.txt"

    try:
        with open(output_file, "w") as file:
            page_number = 1
            while True:
                print(f"Scraping page {page_number}...")
                scrape_obituary_notices(page, file)
                
                next_button_selector = "a:has-text('Next'), button:has-text('Next')"
                if page.query_selector(next_button_selector):
                    page.click(next_button_selector)
                    page.wait_for_load_state("domcontentloaded") 
                    page_number += 1
                else:
                    print("No more pages to scrape.")
                    break
        print(f"All obituary notices have been saved to '{output_file}'.")
    except Exception as e:
        print(f"Error during pagination: {e}")

def scrape_obituary_notices(page, file):
    """Scrapes obituary notices from the current page"""
    try:
        h2_elements = page.query_selector_all("h2.pld-post-title")
        if h2_elements:
            for i, h2 in enumerate(h2_elements, start=1):
                h2_text = clean_text(h2.inner_text())
                file.write(f"Obituary Notice: {h2_text}\n")
        else:
            file.write("No obituary notices found on this page.\n")
    except Exception as e:
        print(f"Error scraping obituaries on the current page: {e}")

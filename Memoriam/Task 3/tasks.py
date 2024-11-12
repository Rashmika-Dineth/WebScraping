from robocorp.tasks import task
from robocorp import browser

@task
def read_obituary_notices():
    """Get the obituary notices and handle consent banner"""
    # Slow down the system to simulate user-like interaction
    browser.configure(slowmo=100)
    open_the_website()
    scrape_obituary_notices()

def open_the_website():
    """Navigates to the given URL and closes the consent banner if present"""
    # Navigate to the website
    browser.goto("https://www.sundayobserver.lk/category/obituaries/")
    page = browser.page()
    try:
        # Attempt to locate and click the consent button (using a broader selector)
        consent_button_selector = "button:has-text('Consent'), button:has-text('Consent'), button:has-text('Consent')"
        if page.query_selector(consent_button_selector):
            page.click(consent_button_selector)
    except Exception as e:
        print(f"An error occurred while trying to close the consent banner: {e}")

def clean_html_entities(input_text):
    # Replace &ZeroWidthSpace; with an empty string (or space if needed)
    cleaned_text = input_text.replace("&ZeroWidthSpace;", "")
    
    # Optionally handle other common HTML entities
    cleaned_text = cleaned_text.replace("&nbsp;", " ")  # Convert non-breaking space to normal space
    cleaned_text = re.sub(r"&[a-zA-Z0-9#]+;", "", cleaned_text)  # Remove other HTML entities if necessary
    
    # Clean any leading or trailing spaces
    cleaned_text = cleaned_text.strip()
    
    return cleaned_text

def scrape_obituary_notices():
    """Scrapes obituary notices from the website and saves them to a file"""
    page = browser.page()

    try:
        p_elements = page.query_selector_all("div.theiaStickySidebar div.item-content p")
        
        with open("obituary_notices.txt", "w") as file:
            if p_elements:
                for i, p in enumerate(p_elements, start=1):
                    p_text = p.inner_text().strip().replace("\u200b", "")
                    if p_text:
                        file.write(f"Obituary Notice {i}: {p_text}\n")
                        print(f"Obituary Notice {i}: {p_text}")  
                print("Obituary notices have been written to 'obituary_notices.txt'.")
            else:
                file.write("No obituary notices found.\n")
                print("No obituary notices found.")
                
    except Exception as e:
        print(f"An error occurred while trying to locate p elements: {e}")
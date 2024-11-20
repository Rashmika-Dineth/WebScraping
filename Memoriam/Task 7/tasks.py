from robocorp.tasks import task
from robocorp import browser


@task
def read_obituary_notices():
    """Main task to scrape all obituary notices by loading all content."""
    # Configure browser
    browser.configure(slowmo=1, headless=True)  # Adjust as needed
    
    # Open the website and handle consent
    open_the_website()
    
    # Load all content by clicking "Load More Posts"
    load_all_posts()
    
    # Scrape obituary notices
    scrape_obituary_notices()


def open_the_website():
    """Navigate to the obituary page and handle the consent banner."""
    browser.goto("https://www.sundayobserver.lk/category/obituaries/")
    
    # Handle consent banner
    try:
        consent_button_selector = "button:has-text('Consent')"
        if browser.page().query_selector(consent_button_selector):
            browser.page().click(consent_button_selector)
            print("Consent banner closed.")
    except Exception as e:
        print(f"An error occurred while handling the consent banner: {e}")


def load_all_posts():
    """Click the 'Load More Posts' button until all content is loaded."""
    load_more_button_selector = "a.penci-ajax-more-button"
    no_more_posts_message_selector = "div.penci-pagination:has-text('Sorry, No more posts')"

    while True:
        try:
            page = browser.page()
            
            # Check if the "No more posts" message is visible
            if page.query_selector(no_more_posts_message_selector):
                print("All posts have been loaded. No more posts available.")
                break
            
            # Check if the "Load More Posts" button is present
            load_more_button = page.query_selector(load_more_button_selector)
            if load_more_button:
                load_more_button.scroll_into_view_if_needed()
                load_more_button.click()
                print("Clicked 'Load More Posts'. Waiting for new content to load...")
                
                # Wait for new content to load
                page.wait_for_selector("div.theiaStickySidebar div.item-content p", timeout=5000)
            else:
                print("Load More Posts button not found.")
                break
                
        except Exception as e:
            print(f"An error occurred while loading more posts: {e}")
            break


def scrape_obituary_notices():
    """Scrape obituary notices and save to a text file."""
    try:
        page = browser.page()
        
        # Wait for the obituary notices to be visible
        page.wait_for_selector("div.theiaStickySidebar div.item-content p", timeout=10000)
        
        # Find all <p> elements containing obituary notices
        p_elements = page.query_selector_all("div.theiaStickySidebar div.item-content p")
        
        # Save the extracted notices to a file
        with open("obituary_notices.txt", "a") as file:
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
        print(f"An error occurred while scraping obituary notices: {e}")

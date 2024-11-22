#playwrite - codes methods

from robocorp.tasks import task
from robocorp import browser
from RPA.Excel.Files import Files

@task
def bookstore_python():
    """Insert the sales data for the week and export it as a PDF"""
    browser.configure(
        slowmo=100,
        headless=True
    )
    open_the_website()
    [title_list,price_list] = collect_book_data()
    fill_excell_worksheet(title_list,price_list)

def open_the_website():
    """Navigates to the given URL"""
    browser.goto("https://fspacheco.github.io/rpa-challenge/bookstore.html")

def collect_book_data():
    """Collect title and price for all books"""
    page = browser.page()

    titles = page.locator("div.book-title").all_text_contents()
    prices_text = page.locator("div.book-price").all_text_contents()
    prices=[]
    for p in prices_text:
        prices.append(float(p.replace("$","")))

    return titles, prices

def fill_excell_worksheet(titles, prices):
    """Save data to excel file"""
    excel = Files()
    excel.create_workbook("bookstore.xlsx", sheet_name="books")
    excel.append_rows_to_worksheet([('No','Title','Price')])
    min_value = min(prices)
    for idx,t in enumerate(titles):
        excel.append_rows_to_worksheet([(idx, t,prices[idx])])
        if(min_value==prices[idx]):
            excel.set_styles( "C"+str(idx+2) ,cell_fill="green")
            print(min_value," is ",idx)

    excel.auto_size_columns("B", width=len(max(titles, key=len)))

    excel.save_workbook()
    excel.close_workbook()
    

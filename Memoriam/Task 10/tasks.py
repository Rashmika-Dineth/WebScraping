#playwrite - codes methods

from robocorp.tasks import task
from robocorp import browser
from RPA.Excel.Files import Files

@task
def bookstore_python():
    """Insert the sales data for the week and export it as a PDF"""
    browser.configure(
        slowmo=2000,
        headless=False
    )
    open_the_website()
    #[title_list,price_list] = collect_book_data()
    #fill_excell_worksheet(title_list,price_list)
    cart_count = check_the_cart_count()
    sort_value = sort_item_by_price()
    search_name = search_item_by_name()

    if(cart_count & sort_value & search_name):
        print("\n **************** Test Pass **************** \n")
    else:
        print("\n **************** Test Fail **************** \n")


def open_the_website():
    """Navigates to the given URL"""
    browser.goto("https://fspacheco.github.io/rpa-challenge/kirjakauppa.html")

def collect_book_data():
    """Collect title and price for all books"""
    page = browser.page()

    titles = page.locator("div.kirjan-nimi").all_text_contents()
    prices_text = page.locator("div.hinta").all_text_contents()
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

def check_the_cart_count():

    print("\nCheck when you click to add an item to cart, the cart correctly updated or not \n ")
    page = browser.page()
    for x in range (1,10):
        page.click(".lisaa-ostoskoriin")
        cart_count_text = page.text_content("#cart-info .cart-count")
        cart_count = int(cart_count_text.strip())  
        try:    
            if x == cart_count:
                print("Correct: Value should be "+ str(x) + " and getting "+ str(cart_count) )
            else: 
                print("Incorrect: Value should be "+ str(x) + " but getting "+ str(cart_count) )
                return False
        except: 
            return True

def sort_item_by_price():
    print("\nCheck the items are sorted according to the price")
    page = browser.page()

    page.select_option("#sortSelect", str("Lajittele hinnan mukaan"))
    prices_text = page.locator("div.hinta").all_text_contents()
    prices=[]
    for p in prices_text:
        prices.append(float(p.replace("$","")))
    # print(prices)

    i=0
    while i< len(prices)-1:
        if(prices[i] <= prices[i+1]):
            print(f"Correct : {prices[i]} is less than {prices[i+1]} ") 
        else: 
            print(f"Incorrect : {prices[i]} is not less than {prices[i+1]} ") 
            print("Items are not sorted correctly")
            return False
        i += 1
    return True

def search_item_by_name():
    print("\nCheck the items search according to the name")
    page = browser.page()
    titles = page.locator("div.kirjan-nimi").all_text_contents()
        
    for book in titles:
        searched_titles = []
        page.fill("#searchInput", book)
        searched_titles.append(page.locator("div.kirjan-nimi").all_text_contents())

    out = any(check in titles for check in searched_titles)
    if out:
        print("The searched items can be found in the list") 
    else :
        print("The searched items can not be found in the list")
        return False
    return True
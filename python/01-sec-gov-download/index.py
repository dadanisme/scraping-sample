from playwright.sync_api import sync_playwright, Browser
from helper import get_data

playwright = sync_playwright().start()
browser = playwright.chromium.launch(headless=False)
page = browser.new_page()

# go to the page
page.goto("https://www.sec.gov/divisions/enforce/friactions.htm")

# get nested anchor tags
anchors = page.query_selector_all("a")

# filter out the anchor tags that is not number
years = [anchor.inner_text()
         for anchor in anchors if anchor.text_content().isdigit()]

for year in years:
    print(f"Downloading files in {year}...")
    get_data(browser, year)

# close the browser
browser.close()

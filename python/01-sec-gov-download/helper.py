from playwright.sync_api import Page, Browser


def get_data(browser: Browser, year: str):
    base_url = 'https://www.sec.gov/divisions/enforce/friactions'
    url = ''
    if (int(year) < 2010):
        url = f"{base_url}/friactions{year}.shtml"
    else:
        url = f"{base_url}/friactions{year}.htm"

    # if year is current year, use the url without year
    import datetime
    if (year == str(datetime.datetime.now().year)):
        url = f"{base_url}.htm"

    page: Page = browser.new_page()
    page.goto(url)

    # seek the table
    table = page.query_selector("table")

    # find all a inside td
    table_a = table.query_selector_all("td a")

    for index, a in enumerate(table_a):
        print(f"{a.inner_text()} ({index+1}/{len(table_a)})")
        href = a.get_attribute("href")
        url = f"https://www.sec.gov{href}"

        # create pdf/{year} folder if not exist
        import os
        current_path = os.path.dirname(os.path.abspath(__file__))

        if not os.path.exists(f'{current_path}/pdf'):
            os.mkdir(f'{current_path}/pdf')
        if not os.path.exists(f'{current_path}/pdf/{year}'):
            os.mkdir(f'{current_path}/pdf/{year}')

        path = f"{current_path}/pdf/{year}/{a.inner_text()}.pdf"

        # download the pdf
        with open(path, "wb") as f:
            res = page.request.get(url, timeout=0)
            f.write(res.body())

    # close the page
    page.close()

from data_scraping.azure_scraping.common import extract_extension


def is_excel_data_url(url):
    return url.endswith('excel.json')


def has_excel_extension(url):
    return extract_extension(url) in ['xls', 'xlsx', 'xlsb', 'xlsm']

from setuptools import setup, find_packages

with open('requirements.txt') as f:
    required = f.read().splitlines()

setup(
    name='scraping',
    version='1.0',
    packages=find_packages(),
    install_requires=required,
    entry_points={
        'scrapy': ['settings = data_scraping.gmd.settings'],
        'console_scripts': [
            'run_spiders = tools.run_spiders:run_spiders',
            'zyte_report = tools.zyte_report:zyte_report',
            'scrapy_crawl_data_samples = tools.scrapy_crawl_data_samples:scrapy_crawl_data_samples',
        ]
    },
)

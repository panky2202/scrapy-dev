import argparse
import os
import subprocess


def scrapy_crawl_data_samples():
    parser = argparse.ArgumentParser(description='Scrapes samples of Products for all Spiders')
    parser.add_argument('--output', '-o', type=str, help='Output directory', required=True)
    parser.add_argument('--size', '-s', type=int, help='Spider sample size', default=30)
    parser.add_argument('--timeout', '-t', type=int, help='Spider timeout in seconds', default=15)
    args = parser.parse_args()

    spiders = subprocess.run(['scrapy', 'list'], stdout=subprocess.PIPE).stdout.decode('utf-8').split('\n')
    for spider in spiders:
        if spider:
            subprocess.run(
                ['scrapy', 'crawl',
                 '--set', f'CLOSESPIDER_ITEMCOUNT={args.size}',
                 '--set', f'CLOSESPIDER_TIMEOUT={args.timeout}',
                 '--output', os.path.join(args.output, f'{spider}.csv'),
                 spider]
            )

import argparse
import os
from types import SimpleNamespace

import requests


def zyte(project_id, api_key):
    def get_spiders_from_zyte():
        """ Gets deployed spiders from Zyte cloud.

        Returns:
            list: ['spider_name_1', 'spider_name_2']
        """
        params = dict(project=project_id)
        response = requests.get('https://app.scrapinghub.com/api/spiders/list.json', params=params, auth=(api_key, ''))
        return [spider['id'] for spider in response.json()['spiders']]

    def run_spider_on_zyte(spider_name):
        """ Schedule a spider for running.

         Args:
            spider_name (str): name of the spider to run

         Returns:
             str: job id
         """
        print(f'Running spider {spider_name}...')
        data = dict(project=project_id, spider=spider_name)
        response = requests.post('https://app.scrapinghub.com/api/run.json', data=data, auth=(api_key, ''))
        return response.json()['jobid']

    return SimpleNamespace(
        get_spiders=get_spiders_from_zyte,
        run_spider=run_spider_on_zyte
    )


def run_spiders():
    parser = argparse.ArgumentParser(description='Run all spiders on Zyte cloud')
    parser.add_argument('--project_id', '-p', type=int, help='Zyte project id', required=True)
    args = parser.parse_args()

    api_key = os.environ['SHUB_APIKEY']
    project_id = args.project_id

    z = zyte(project_id, api_key)

    for spider in z.get_spiders():
        z.run_spider(spider)

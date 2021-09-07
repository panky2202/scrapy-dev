import {KQLProvider, KQLRequest} from '../ports/KQLProvider'
import axios, {AxiosInstance, AxiosRequestConfig} from 'axios'

function request(instance: AxiosInstance): KQLRequest {
  return {
    query: async (kql) => {
      const response = await instance.post('query', {query: kql})
      return {
        records: response.data.tables[0].rows,
      }
    },
  }
}

export const kqlProviderNode = (config: AxiosRequestConfig): KQLProvider => {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
  })

  return {
    name: () => instance.name,
    request: () => request(instance),
  }
}

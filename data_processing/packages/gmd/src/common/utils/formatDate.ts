import {DateType} from '../domain/value-objects'
import dayjs from 'dayjs'

export function formatDate(date: DateType) {
  return dayjs(date).format('MM/DD/YYYY')
}

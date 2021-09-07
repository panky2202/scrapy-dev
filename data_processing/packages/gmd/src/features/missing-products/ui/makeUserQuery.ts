import {useRouter} from 'next/router'
import {UseQuery} from './ports/UseQuery'

export function makeUserQuery(): UseQuery<any> {
  return function useQuery() {
    const {query} = useRouter()
    return {
      query,
    }
  }
}

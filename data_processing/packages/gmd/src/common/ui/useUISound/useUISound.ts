import {UseUISound} from './ports/UseUISound'
import useSound from 'use-sound'

export function useUISound(
  ...params: Parameters<UseUISound>
): ReturnType<UseUISound> {
  const [{mp3}] = params
  const [play, {stop, isPlaying, pause}] = useSound(mp3)
  return [play, {stop, isPlaying, pause}]
}

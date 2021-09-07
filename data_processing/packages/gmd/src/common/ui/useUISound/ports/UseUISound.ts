export type UseUISound = (params: {
  mp3: any
}) => [() => void, {stop: () => void; pause: () => void; isPlaying: boolean}]

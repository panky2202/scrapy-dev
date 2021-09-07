import {WebClient, Block, KnownBlock} from '@slack/web-api'

export type SlackConfig = {
  token: string
}

export type SlackBlock = Block | KnownBlock

export type SlackProvider = {
  postMessage: (params: {text: string; channel: string}) => Promise<void>
  postBlockMessage: (params: {
    blocks: SlackBlock[]
    channel: string
  }) => Promise<void>
}

export function slackProviderWebAPI(config: SlackConfig): SlackProvider {
  const client = new WebClient(config.token)

  return {
    postMessage: async (params) => {
      await client.chat.postMessage(params)
    },
    postBlockMessage: async (params) => {
      await client.chat.postMessage(params)
    },
  }
}

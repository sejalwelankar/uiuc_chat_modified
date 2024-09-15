import { OllamaModel, OllamaModels } from '~/utils/modelProviders/ollama'
import { WebllmModel } from '~/utils/modelProviders/WebLLM'
import {
  OpenAIModel,
  OpenAIModelID,
  OpenAIModels,
} from '~/utils/modelProviders/types/openai'
import {
  AnthropicModel,
  AnthropicModelID,
  AnthropicModels,
} from '~/utils/modelProviders/types/anthropic'
import {
  AzureModel,
  AzureModelID,
  AzureModels,
} from '~/utils/modelProviders/azure'
import { Conversation } from '../../types/chat'
import { NCSAHostedModels } from '~/utils/modelProviders/NCSAHosted'

export enum ProviderNames {
  Ollama = 'Ollama',
  OpenAI = 'OpenAI',
  Azure = 'Azure',
  Anthropic = 'Anthropic',
  WebLLM = 'WebLLM',
  NCSAHosted = 'NCSAHosted',
}

export type AnySupportedModel =
  | OllamaModel
  | OpenAIModel
  | WebllmModel
  | AnthropicModel
  | AzureModel

// Add other vision capable models as needed
export const VisionCapableModels: Set<
  OpenAIModelID | AzureModelID | AnthropicModelID
> = new Set([
  OpenAIModelID.GPT_4_Turbo,
  OpenAIModelID.GPT_4o,
  OpenAIModelID.GPT_4o_mini,

  AzureModelID.GPT_4_Turbo,
  AzureModelID.GPT_4o,
  AzureModelID.GPT_4o_mini,
  // claude-3.5....
  AnthropicModelID.Claude_3_5_Sonnet,
])

export const AllSupportedModels: Set<GenericSupportedModel> = new Set([
  ...Object.values(AnthropicModels),
  ...Object.values(OpenAIModels),
  ...Object.values(AzureModels),
  ...Object.values(OllamaModels),
  ...Object.values(NCSAHostedModels),
  // ...webLLMModels,
])
// e.g. Easily validate ALL POSSIBLE models that we support. They may be offline or disabled, but they are supported.
// {
//   id: 'llama3.1:70b',
//   name: 'Llama 3.1 70b',
//   parameterSize: '70b',
//   tokenLimit: 16385,
//   enabled: false
// },
//   {
//   id: 'gpt-3.5-turbo',
//   name: 'GPT-3.5',
//   tokenLimit: 16385,
//   enabled: false
// },

export interface GenericSupportedModel {
  id: string
  name: string
  tokenLimit: number
  enabled: boolean
  parameterSize?: string
}

export interface BaseLLMProvider {
  provider: ProviderNames
  enabled: boolean
  baseUrl?: string
  apiKey?: string
  error?: string
}

export interface OllamaProvider extends BaseLLMProvider {
  provider: ProviderNames.Ollama
  models?: OllamaModel[]
}

export interface NCSAHostedProvider extends BaseLLMProvider {
  // This uses Ollama, but hosted by NCSA. Keep it separate.
  provider: ProviderNames.NCSAHosted
  models?: OllamaModel[]
}

export interface OpenAIProvider extends BaseLLMProvider {
  provider: ProviderNames.OpenAI
  models?: OpenAIModel[]
}

export interface AzureProvider extends BaseLLMProvider {
  provider: ProviderNames.Azure
  models?: AzureModel[]
  AzureEndpoint?: string
  AzureDeployment?: string
}

export interface AnthropicProvider extends BaseLLMProvider {
  provider: ProviderNames.Anthropic
  models?: AnthropicModel[]
}

export interface WebLLMProvider extends BaseLLMProvider {
  provider: ProviderNames.WebLLM
  models?: WebllmModel[]
  downloadSize?: string
  vram_required_MB?: string
}

export type LLMProvider =
  | OllamaProvider
  | OpenAIProvider
  | AzureProvider
  | AnthropicProvider
  | WebLLMProvider
  | NCSAHostedProvider

// export type AllLLMProviders = {
//   [P in ProviderNames]?: LLMProvider & { provider: P }
// }

// export interface AllLLMProviders {
//   [key: string]: LLMProvider & { provider: ProviderNames } | undefined;
// }

export type AllLLMProviders = {
  [key in ProviderNames]: LLMProvider
}

// Ordered list of preferred model IDs -- the first available model will be used as default
export const preferredModelIds = [
  OpenAIModelID.GPT_4o_mini,
  OpenAIModelID.GPT_4o,
  OpenAIModelID.GPT_4_Turbo,
  OpenAIModelID.GPT_4,
  OpenAIModelID.GPT_3_5,
  AzureModelID.GPT_4o_mini,
  AzureModelID.GPT_4o,
  AzureModelID.GPT_4_Turbo,
  AzureModelID.GPT_4,
  AnthropicModelID.Claude_3_5_Sonnet,
  AnthropicModelID.Claude_3_Opus,
  AnthropicModelID.Claude_3_Haiku,
]

export const selectBestModel = (
  allLLMProviders: AllLLMProviders,
  convo?: Conversation,
): GenericSupportedModel => {
  const allModels = Object.values(allLLMProviders)
    .filter((provider) => provider!.enabled)
    .flatMap((provider) => provider!.models || [])
    .filter((model) => model.enabled)

  // console.log('in selectBestModel with models: ', allModels)
  // TODO: if project has global default model, use it.
  // First, try to use the model from the conversation if it exists and is valid
  // if (
  //   convo &&
  //   convo.model &&
  //   typeof convo.model === 'object' &&
  //   'id' in convo.model
  // ) {
  //   const conversationModel = allModels.find((m) => m.id === convo.model.id)
  //   if (conversationModel) {
  //     return conversationModel
  //   }
  // }
  const defaultModelId = localStorage.getItem('defaultModel')
  // console.log('defaultModelId from localstorage: ', defaultModelId)
  if (defaultModelId && allModels.find((m) => m.id === defaultModelId)) {
    const defaultModel = allModels
      .filter((model) => model.enabled)
      .find((m) => m.id === defaultModelId)
    // console.log('FOUND DEFAULT MODEL in localStorage: ', defaultModel)
    if (defaultModel) {
      return defaultModel
    }
  }

  // If the conversation model is not available or invalid, use the preferredModelIds
  for (const preferredId of preferredModelIds) {
    const model = allModels
      .filter((model) => model.enabled)
      .find((m) => m.id === preferredId)
    if (model) {
      // console.log('FOUND PREFERRED MODEL from hardcoded list: ', model)
      localStorage.setItem('defaultModel', preferredId)
      return model
    }
  }

  // If no preferred models are available, fallback to Llama 3.1 70b
  // console.log('NO PREFERRED MODEL FOUND, USING FALLBACK MODEL')
  localStorage.setItem('defaultModel', 'llama3.1:70b')
  return {
    id: 'llama3.1:70b',
    name: 'Llama 3.1 70b',
    tokenLimit: 128000,
    enabled: true,
  }
}

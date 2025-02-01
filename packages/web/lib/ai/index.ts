import { createOpenAI } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";
import { Resource } from "sst";

const openai = createOpenAI({ apiKey: Resource.OpenAiApiKey.value });

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: openai(apiIdentifier),
    middleware: customMiddleware,
  });
};

export const imageGenerationModel = openai.image("dall-e-3");

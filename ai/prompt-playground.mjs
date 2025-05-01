import { ChatPromptTemplate } from '@langchain/core/prompts';


// this will take the system prompt and return the ChatPromptTemplate...maybe
export function setupSystemPrompt(systemPrompt) {
  const prompt = ChatPromptTemplate.fromMessages([
    [ 'system',  systemPrompt],
    [ 'human', '{input}' ]
  ]);

  return prompt;
}
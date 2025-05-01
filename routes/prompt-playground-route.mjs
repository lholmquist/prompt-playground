import { getModel } from '../ai/ai-config.mjs';
import { setupSystemPrompt } from '../ai/prompt-playground.mjs';
import { ChatPromptTemplate } from '@langchain/core/prompts';

async function promptPlaygroundRoute (fastify, options) {
  fastify.get('/api/playground', (request, reply) => {
    return reply.send('This is a GET reqest bro');
  });

  fastify.post('/api/playground', async (request, reply) => {
    // request body should have a json object like this:
    /* TODO: also send the temperature and anything else?
      {
        prompt: {
          system: 'sdfsd',
          human: 'sdfsf'
        }
      }
    */


    // The way it should work is:
    /**
     * paste in the system prompt in the textarea, doesn't send anything yet
     * clicks start new conversation, this sends the system prompt to the server and creates the session which is returned?
     * new chat prompt object can be 
     * User then types in the question and sends that
     * answer is returned
     * asks follow up question
     * If we need a new system prompt
     *  * User can also modify the temperature at this point - this can come later?
     * User then asks a question
     * Answer is returned
     */

    const promptFromRequest = request.body.prompt;
    const model = getModel();

    const prompt = setupSystemPrompt(promptFromRequest.system);
    // const prompt = ChatPromptTemplate.fromMessages([
    //   [ 'system',  promptFromRequest.system],
    //   [ 'human', '{input}' ]
    // ]);

    const chain = prompt.pipe(model);
    const response = await chain.invoke({
      input: promptFromRequest.human
    });

    console.log(response);
    return {
      result: response.content
    };
  });
}

export default promptPlaygroundRoute;
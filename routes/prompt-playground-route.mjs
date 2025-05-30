import * as traceloop from "@traceloop/node-server-sdk";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { getModel } from '../ai/ai-config.mjs';
import { setupSystemPrompt } from '../ai/prompt-playground.mjs';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as ChainsModule from 'langchain/chains';
import * as ToolsModule from 'langchain/tools';
import * as RunnablesModule from '@langchain/core/runnables';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

traceloop.initialize({
  logLevel: 'debug',
  disableBatch: true,
  exporter: new OTLPTraceExporter(),
  baseUrl: 'http://localhost:1000/api/otel',
  // baseUrl: 'http://otel-collector.parasol-app-user2-dev.svc.cluster.local:4317',
  // baseUrl: 'https://admin-parasol-insurance-parasol-webui.apps.cluster-qqqjs.qqqjs.sandbox3296.opentlc.com/api/otel',
  appName: 'Prompt Playground',
  instrumentModules: {
    langchain: {
      chainsModule: ChainsModule,
      toolsModule: ToolsModule,
      runnablesModule: RunnablesModule
    }
  }
 });


async function promptPlaygroundRoute (fastify, options) {
  fastify.addContentTypeParser('application/x-protobuf', function (request, payload, done) {
    return done(null, payload);
  });

  fastify.get('/api/playground', (request, reply) => {
    return reply.send('This is a GET reqest bro');
  });

  fastify.post('/api/otel/v1/traces', async (request , reply) => {
    console.log(request);
    return {yup: 'yup'};
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

    // const prompt = setupSystemPrompt(promptFromRequest.system);
    const prompt = ChatPromptTemplate.fromMessages([
      [ 'system',  promptFromRequest.system],
      [ 'human', '{input}' ]
    ]);

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
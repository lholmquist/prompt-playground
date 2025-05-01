import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyEnv from '@fastify/env';
import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup Logging
const fastify = Fastify({
  logger: true
});

// Register the Fastify ENV plugin for reading the .env files
await fastify.register(fastifyEnv, {
  schema: {
    type: 'object'
  },
  dotenv: true
});

import promptPlaygroundRoute from './routes/prompt-playground-route.mjs';

// WebUI related setup and serving
const webuiLocation = './public';

fastify.register(fastifyStatic, {
  wildcard: false,
  root: path.join(__dirname, webuiLocation)
});

fastify.get('/*', (req, res) => {
  res.send(fs.createReadStream(path.join(__dirname, webuiLocation, 'index.html')));
});

fastify.register(promptPlaygroundRoute);

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 8005 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
};
start();
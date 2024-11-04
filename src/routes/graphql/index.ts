import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate, specifiedRules, GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './schemas.js';
import { buildContext } from './context.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      try {
        const { query, variables } = req.body;
        const validationErrors = validate(schema, parse(query), [
          ...specifiedRules,
          depthLimit(5),
        ]);

        if (validationErrors.length > 0) {
          return { errors: validationErrors };
        }

        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: buildContext(req, fastify),
        });

        return result;
      } catch (error: any) {
        console.error('GraphQL Execution Error:', error);
        return { errors: [new GraphQLError(error.message)] };
      }
    },
  });
};

export default plugin;

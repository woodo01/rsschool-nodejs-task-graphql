import { Type } from '@fastify/type-provider-typebox';
import { GraphQLSchema } from 'graphql';
import { RootQueryType } from './types/query.js';

export const schema = new GraphQLSchema({
  query: RootQueryType,
});

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

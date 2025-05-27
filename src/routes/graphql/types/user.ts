import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profile.js';
import { PostType } from './post.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (parent, args, context) => {
        const { profileLoader } = context.loaders;
        return profileLoader.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async (parent, args, context) => {
        const { postsByAuthorIdLoader } = context.loaders;
        return postsByAuthorIdLoader.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (parent, args, context) => {
        if (parent.userSubscribedTo) {
          return await context.loaders.userLoader.loadMany(parent.userSubscribedTo.map((sub) => sub.authorId));
        }
        const { userSubscribedToLoader } = context.loaders;
        return userSubscribedToLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (parent, args, context) => {
        if (parent.subscribedToUser) {
          return await context.loaders.userLoader.loadMany(parent.subscribedToUser.map((sub) => sub.subscriberId));
        }
        const { subscribedToUserLoader } = context.loaders;
        return subscribedToUserLoader.load(parent.id);
      },
    },
  }),
});

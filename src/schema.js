import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt
} from 'graphql';

let count = 0;

let Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      count: {
        type: GraphQLInt,
        resolve: function() {
          return 8000;
        }
      },

      count2: {
        type: GraphQLInt,
        resolve: function() {
          return 8000;
        },
        description: "This is count 2"
      }
    }
  })
});

export default Schema;
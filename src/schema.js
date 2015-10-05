import PostsList from './data/posts';
import AuthorsMap from './data/authors';
import * as _ from 'underscore';

import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType
} from 'graphql';

const Category = new GraphQLEnumType({
  name: "Category",
  description: "A Category of the blog",
  values: {
    METEOR: {value: "meteor"},
    PRODUCT: {value: "product"},
    USER_STORY: {value: "user-story"},
    OTHER: {value: 'other'}
  }
});

const Author = new GraphQLObjectType({
  name: "Author",
  description: "Represent the type of an author of a blog post or a comment",
  fields: () => ({
    _id: {type: GraphQLString},
    name: {type: GraphQLString},
    twitterHandle: {type: GraphQLString}
  })
});

const Comment = new GraphQLObjectType({
  name: "Comment",
  description: "Represent the type of a comment",
  fields: () => ({
    _id: {type: GraphQLString},
    content: {type: GraphQLString},
    author: {
      type: Author,
      resolve: function({author}) {
        return AuthorsMap[author];
      }
    },
    timestamp: {type: GraphQLFloat},
    replies: {
      type: new GraphQLList(Comment),
      description: "Replies for the comment"
    }
  })
});

const Post = new GraphQLObjectType({
  name: "Post",
  description: "Represent the type of a blog post",
  fields: () => ({
    _id: {type: GraphQLString},
    title: {type: GraphQLString},
    category: {type: Category},
    summary: {type: GraphQLString},
    content: {type: GraphQLString},
    timestamp: {
      type: GraphQLFloat,
      resolve: function(post) {
        if(post.date) {
          return new Date(post.date['$date']).getTime();
        } else {
          return null;
        }
      }
    },
    comments: {type: new GraphQLList(Comment)},
    author: {
      type: Author,
      resolve: function({author}) {
        return AuthorsMap[author];
      }
    }
  })
});

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Blog',
    description: "Root of the Blog Schema",
    fields: () => ({
      getPosts: {
        type: new GraphQLList(Post),
        description: "Get a list of posts in the blog",
        args: {
          category: {type: Category}
        },
        resolve: function(prev, {category}) {
          if(category) {
            return _.filter(PostsList, post => post.category === category);
          } else {
            return PostsList;
          }
        }
      },

      getRecentPosts: {
        type: new GraphQLList(Post),
        description: "Get recent posts in the blog",
        args: {
          count: {type: GraphQLInt, description: 'Number of recent items'}
        },
        resolve: function(_, {count}) {
          return []
        }
      },

      getPostById: {
        type: Post,
        description: "Get a post by it's _id",
        args: {
          _id: {type: GraphQLString}
        },
        resolve: function(_, {_id}) {
          return null
        }
      }
    })
  })
});

export default Schema;
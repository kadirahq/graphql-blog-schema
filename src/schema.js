import * as _ from 'underscore';

import PostsList from './data/posts';
import AuthorsMap from './data/authors';
import {CommentList, ReplyList} from './data/comments';

import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLInterfaceType
} from 'graphql';

const Category = new GraphQLEnumType({
  name: 'Category',
  description: 'A Category of the blog',
  values: {
    METEOR: {value: 'meteor'},
    PRODUCT: {value: 'product'},
    USER_STORY: {value: 'user-story'},
    OTHER: {value: 'other'}
  }
});

const Author = new GraphQLObjectType({
  name: 'Author',
  description: 'Represent the type of an author of a blog post or a comment',
  fields: () => ({
    _id: {type: GraphQLString},
    name: {type: GraphQLString},
    twitterHandle: {type: GraphQLString}
  })
});

const HasAuthor = new GraphQLInterfaceType({
  name: 'HasAuthor',
  description: 'This type has an author',
  fields: () => ({
    author: {type: Author}
  }),
  resolveType: (obj) => {
    if(obj.title) {
      return Post;
    } else if(obj.replies) {
      return Comment;
    } else {
      return null;
    }
  }
});

const Comment = new GraphQLObjectType({
  name: 'Comment',
  interfaces: [HasAuthor],
  description: 'Represent the type of a comment',
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
      description: 'Replies for the comment',
      resolve: function() {
        return ReplyList;
      }
    }
  })
});

const Post = new GraphQLObjectType({
  name: 'Post',
  interfaces: [HasAuthor],
  description: 'Represent the type of a blog post',
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
    comments: {
      type: new GraphQLList(Comment),
      args: {
        limit: {type: GraphQLInt, description: 'Limit the comments returing'}
      },
      resolve: function(post, {limit}) {
        if(limit >= 0) {
          return CommentList.slice(0, limit);
        }

        return CommentList;
      }
    },
    author: {
      type: Author,
      resolve: function({author}) {
        return AuthorsMap[author];
      }
    }
  })
});

const Query = new GraphQLObjectType({
  name: 'BlogSchema',
  description: 'Root of the Blog Schema',
  fields: () => ({
    posts: {
      type: new GraphQLList(Post),
      description: 'List of posts in the blog',
      args: {
        category: {type: Category}
      },
      resolve: function(source, {category}) {
        if(category) {
          return _.filter(PostsList, post => post.category === category);
        } else {
          return PostsList;
        }
      }
    },

    latestPost: {
      type: Post,
      description: 'Latest post in the blog',
      resolve: function() {
        PostsList.sort((a, b) => {
          var bTime = new Date(b.date['$date']).getTime();
          var aTime = new Date(a.date['$date']).getTime();

          return bTime - aTime;
        });

        return PostsList[0];
      }
    },

    recentPosts: {
      type: new GraphQLList(Post),
      description: 'Recent posts in the blog',
      args: {
        count: {type: new GraphQLNonNull(GraphQLInt), description: 'Number of recent items'}
      },
      resolve: function(source, {count}) {
        PostsList.sort((a, b) => {
          var bTime = new Date(b.date['$date']).getTime();
          var aTime = new Date(a.date['$date']).getTime();

          return bTime - aTime;
        });

        return PostsList.slice(0, count)
      }
    },

    post: {
      type: Post,
      description: 'Post by _id',
      args: {
        _id: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve: function(source, {_id}) {
        return _.filter(PostsList, post => post._id === _id)[0];
      }
    },

    authors: {
      type: new GraphQLList(Author),
      description: 'Available authors in the blog',
      resolve: function() {
        return _.values(AuthorsMap);
      }
    },

    author: {
      type: Author,
      description: 'Author by _id',
      args: {
        _id: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve: function(source, {_id}) {
        return AuthorsMap[_id];
      }
    }
  })
});

const Mutation = new GraphQLObjectType({
  name: 'BlogMutations',
  fields: {
    createPost: {
      type: Post,
      description: 'Create a new blog post',
      args: {
        _id: {type: new GraphQLNonNull(GraphQLString)},
        title: {type: new GraphQLNonNull(GraphQLString)},
        content: {type: new GraphQLNonNull(GraphQLString)},
        summary: {type: GraphQLString},
        category: {type: Category},
        author: {type: new GraphQLNonNull(GraphQLString), description: 'Id of the author'}
      },
      resolve: function(source, {...args}) {
        let post = args;
        var alreadyExists = _.findIndex(PostsList, p => p._id === post._id) >= 0;
        if(alreadyExists) {
          throw new Error('Post already exists: ' + post._id);
        }

        if(!AuthorsMap[post.author]) {
          throw new Error('No such author: ' + post.author);
        }

        if(!post.summary) {
          post.summary = post.content.substring(0, 100);
        }

        post.comments = [];
        post.date = {$date: new Date().toString()}

        PostsList.push(post);
        return post;
      }
    },

    createAuthor: {
      type: Author,
      description: 'Create a new author',
      args: {
        _id: {type: new GraphQLNonNull(GraphQLString)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        twitterHandle: {type: GraphQLString}
      },
      resolve: function(source, {...args}) {
        let author = args;
        if(AuthorsMap[args._id]) {
          throw new Error('Author already exists: ' + author._id);
        }

        AuthorsMap[author._id] = author;
        return author;
      }
    }
  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

export default Schema;

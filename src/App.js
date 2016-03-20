import React, { Component } from 'react';
import GraphiQL from 'graphiql';
import Schema from './schema.js';
import 'isomorphic-fetch';

window.a = require('graphql');

export default class App extends Component {
  fetchData({query, variables}) {
    return window.a.graphql(Schema, query, null, JSON.parse(variables || '{}'));
  }

  render() {
    return (
      <GraphiQL fetcher={this.fetchData} />
    );
  }
}

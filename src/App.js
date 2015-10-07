import React, { Component } from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import Schema from './schema.js';
window.a = require('graphql');

export default class App extends Component {
  fetchData({query, variables}) {
    return window.a.graphql(Schema, query, null, JSON.parse(variables));
  }

  render() {
    return (
      <GraphiQL fetcher={this.fetchData} />
    );
  }
}

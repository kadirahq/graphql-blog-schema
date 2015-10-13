import React, { Component } from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import Schema from './schema.js';
import { graphql } from 'graphql';

GraphiQL.Logo = class Logo extends Component {
  render() {
    let style = {
      fontWeight: 800,
      fontSize: 16,
      color: "#252525"
    };

    return (
      <span style={style}>Learn GraphQL Sandbox</span>
    );
  }
}

export default class App extends Component {
  fetchData({query, variables}) {
    let queryVariables = {};
    try {
      queryVariables = JSON.parse(variables);
    } catch(ex) {}
    return graphql(Schema, query, null, queryVariables);
  }

  render() {
    return (
      <GraphiQL fetcher={this.fetchData} />
    );
  }
}

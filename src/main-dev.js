import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader'
import App from './App';

const HotApp = hot(module)(App);
render(<HotApp />, document.getElementById('app'));

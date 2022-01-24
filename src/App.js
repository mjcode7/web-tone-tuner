import React from 'react';
import RootPage from './components/RootPage';
import store from 'store';
import {Provider} from 'react-redux';
import 'lib/polyfills/MediaStream';

// windows 10 fix
require('os').networkInterfaces = function() { return []; };

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <RootPage />
      </Provider>
    );
  }
}

export default App;

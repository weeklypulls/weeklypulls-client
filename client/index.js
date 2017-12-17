import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/app';
import Store from './store';

const store = new Store();
ReactDOM.render(<App store={store} />, document.getElementById('root'));

import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import Store from './store';

const store = new Store();
ReactDOM.render(<App store={store} />, document.getElementById('root'));

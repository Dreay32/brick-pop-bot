
import ReactDOM from 'react-dom';
import React from 'react';
import App from './components/App/App';

import 'index.html';
import './global.css';

const render = Klass =>
    ReactDOM.render(<Klass />, document.getElementById('app'));

if (module.hot) module.hot.accept();

render(App);

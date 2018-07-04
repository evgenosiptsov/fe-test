import React from 'react';
import ReactDOM from 'react-dom';

import HummingbirdModel from './store'
import registerServiceWorker from './registerServiceWorker';
import { observer } from 'mobx-react';

import App from './App';
import './styles/css/index.css';

const hummingbirdStore = new HummingbirdModel();

const ObserverApp = observer(App);
ReactDOM.render(<ObserverApp store={hummingbirdStore}/>, document.getElementById('root'));

registerServiceWorker();

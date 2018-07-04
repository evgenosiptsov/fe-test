import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { renderIntoDocument } from 'react-dom/test-utils'

beforeEach(() => {
	jest.spyOn(console, 'error')
	global.console.error.mockImplementation(() => {})
});

afterEach(() => {
	global.console.error.mockRestore()
});

it('renders without crashing', () => {
  const div = document.createElement('div');
	
	renderIntoDocument(<App />);
});

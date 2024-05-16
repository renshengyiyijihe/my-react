import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('ReactDOM',React.createElement('div', {}, '123'), React, ReactDOM, ReactDOM.createRoot(document.getElementById('root')!))
// ReactDOM.createRoot(document.getElementById('root')!).render(React.createElement('div', {}, '123'));
ReactDOM.createRoot(document.getElementById('root')!).render(<div><div>123</div></div>)
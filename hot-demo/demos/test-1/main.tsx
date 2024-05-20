import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [count, setCount] = useState(0);

	setInterval(() => {
		setCount((v) => v + 1);
	}, 3000);

	console.log('count, setCount', count, setCount);

	return (
		<div>
			{/* <span>title</span> */}
			<span key={count}>{count}</span>
		</div>
	);
};

// console.log('ReactDOM',React.createElement('div', {}, '123'), React, ReactDOM, ReactDOM.createRoot(document.getElementById('root')!))
// ReactDOM.createRoot(document.getElementById('root')!).render(React.createElement('div', {}, '123'));
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

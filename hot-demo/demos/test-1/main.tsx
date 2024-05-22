import { Fragment, useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [count, setCount] = useState(0);

	// setInterval(() => {
	// 	setCount((v) => v + 1);
	// }, 3000);

	console.log('count, setCount', count, setCount);

	return (
		<div>
			<div
				onClick={() => {
					setCount((count) => count + 1);
					setCount((count) => count + 1);
					setCount((count) => count + 1);
				}}
			>
				{count}
			</div>
			{/* {count.map((v, index) => {
				return (
					<p
						key={v}
						onClick={() => {
							setCount((count) => count + 1);
				setCount((count) => count + 1);
				setCount((count) => count + 1);
							console.log('index', index);
							// count[0] == 0 ? setCount([1, 0]) : setCount([0, 1]);
						}}
					>
						{v}
					</p>
				);
			})} */}
		</div>
	);
};

// console.log('ReactDOM',React.createElement('div', {}, '123'), React, ReactDOM, ReactDOM.createRoot(document.getElementById('root')!))
// ReactDOM.createRoot(document.getElementById('root')!).render(React.createElement('div', {}, '123'));
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

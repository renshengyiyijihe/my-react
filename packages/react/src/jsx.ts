import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols';
import {
	Key,
	Ref,
	Props,
	ElementType,
	ReactElementType,
    Type
} from 'shared/ReactTypes';

const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	return {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'yjh'
	};
};

export const jsx = (type: ElementType, config: any, ...children: any[]) => {
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};

	let val;
	for (let prop in config) {
		val = config[prop];
		if (val == undefined || val == null) continue;

		switch (prop) {
			case 'key':
				key = val + '';
				break;
			case 'ref':
				ref = val;
				break;
		}

		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	const childrenLength = children.length;
	if (childrenLength) {
		props.children = childrenLength === 1 ? children[0] : children;
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};

	let val;
	for (let prop in config) {
		val = config[prop];
		if (val == undefined || val == null) continue;

		switch (prop) {
			case 'key':
				key = val + '';
				break;
			case 'ref':
				ref = val;
				break;
		}

		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	return ReactElement(type, key, ref, props);
};

export const Fragment = REACT_FRAGMENT_TYPE;


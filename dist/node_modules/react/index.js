(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.React = factory());
})(this, (function () { 'use strict';

	const supportSymbol = typeof Symbol === 'function' && Symbol.for;
	const REACT_ELEMENT_TYPE = supportSymbol
	    ? Symbol.for('react.element')
	    : 0xeac7;

	const ReactElement = function (type, key, ref, props) {
	    return {
	        $$typeof: REACT_ELEMENT_TYPE,
	        type,
	        key,
	        ref,
	        props,
	        __mark: 'yjh'
	    };
	};
	const jsx = (type, config, ...children) => {
	    let key = null;
	    let ref = null;
	    const props = {};
	    let val;
	    for (let prop in config) {
	        val = config[prop];
	        if (val == undefined || val == null)
	            continue;
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

	var index = {
	    version: '1.0.0',
	    createElement: jsx
	};

	return index;

}));

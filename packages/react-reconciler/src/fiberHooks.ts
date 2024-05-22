import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import { FiberNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';
import internals from 'shared/internals';
import { requestUpdateLane } from './fiberLanes';

const { currentDispatcher } = internals;

// 当前正在处理的 FiberNode
let currentlyRenderingFiber: FiberNode | null = null;
// Hooks 链表中当前正在处理的 Hook
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

export interface Hook {
	memoizedState: any; // 保存 Hook 的数据
	queue: any;
	next: Hook | null;
}

export const renderWithHooks = (workInProgress: FiberNode) => {
	if (__DEV__) {
		console.log('renderWidthHooks start ->>', workInProgress.alternate);
	}

	currentlyRenderingFiber = workInProgress;
	workInProgress.memoizedState = null;

	const current = workInProgress.alternate;
	if (current !== null) {
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		currentDispatcher.current = HooksDispatcherOnMount;
	}
	console.log(
		'currentDispatcher',
		currentDispatcher,
		currentDispatcher.current,
		JSON.stringify(currentDispatcher.current)
	);

	const Component = workInProgress.type;
	const props = workInProgress.pendingProps;
	const children = Component(props);

	currentlyRenderingFiber = null;
	workInProgressHook = null;

	return children;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	const hook = mountWorkInProgressHook();

	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	hook.memoizedState = memoizedState;
	const queue = createUpdateQueue<State>();
	hook.queue = queue;

	const dispatch = dispatchSetState.bind(
		null,
		currentlyRenderingFiber!,
		// @ts-ignore
		queue
	);
	queue.dispatch = dispatch;

	return [memoizedState, dispatch];
}

const mountWorkInProgressHook = () => {
	const hook: Hook = {
		memoizedState: null,
		queue: null,
		next: null
	};

	if (workInProgressHook == null) {
		if (currentlyRenderingFiber !== null) {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		} else {
			throw new Error('Hooks 只能在函数组件中执行');
		}
	} else {
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}

	return workInProgressHook;
};

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const lane = requestUpdateLane();
	const update = createUpdate(action, lane);
	enqueueUpdate(updateQueue, update);

	scheduleUpdateOnFiber(fiber, lane);
}

function updateState<State>(): [State, Dispatch<State>] {
	if (__DEV__) {
		console.log('updateState start');
	}

	const hook = updateWorkInProgressHook();

	const queue = hook.queue as UpdateQueue<State>;
	const pending = queue.shared.pending;
	const lane = requestUpdateLane();

	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(
			hook.memoizedState,
			pending,
			lane
		);
		hook.memoizedState = memoizedState;
	}

	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

function updateWorkInProgressHook(): Hook {
	let nextCurrentHook: Hook | null;

	// 这是函数组件 update 时的第一个 hook
	if (currentHook === null) {
		let current = (currentlyRenderingFiber as FiberNode).alternate;
		if (current === null) {
			nextCurrentHook = null;
		} else {
			nextCurrentHook = current.memoizedState;
		}
	} else {
		nextCurrentHook = (currentHook as Hook).next;
	}

	if (nextCurrentHook == null) {
		throw new Error(
			`组件 ${currentlyRenderingFiber?.type} 本次执行时的 Hooks 比上次执行多`
		);
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		queue: currentHook.queue,
		next: null
	};

	if (workInProgressHook === null) {
		if (currentlyRenderingFiber !== null) {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		} else {
			throw new Error('Hooks 只能在函数组件中执行');
		}
	} else {
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}

	return workInProgressHook;
}

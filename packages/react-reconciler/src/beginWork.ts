import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';

export const beginWork = (workInProgress: FiberNode) => {
	const tag = workInProgress.tag;

	switch (tag) {
		case HostRoot:
			return updateHostRoot(workInProgress);
		case HostComponent:
			return updateHostComponents(workInProgress);
		case HostText:
			return updateHostText(workInProgress);
		default:
			if (__DEV__) {
				console.warn('beginWork未实现类型', tag);
			}
			break;
	}
};

export const updateHostRoot = (workInProgress: FiberNode) => {
	const baseState = workInProgress.memoizedState;
	const updateQueue = workInProgress.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;

	updateQueue.shared.pending = null;

	const { memoizedState } = processUpdateQueue(baseState, pending);
	workInProgress.memoizedState = memoizedState;

	const nextChildren = workInProgress.memoizedState;
	reconcileChildren(workInProgress, nextChildren);

	return workInProgress.child;
};

export const updateHostComponent = (workInProgress: FiberNode) => {
	const nextProps = workInProgress.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(workInProgress, nextChildren);

	return workInProgress.child;
};

export const updateHostText = () => {
	return null;
};

export const reconcileChildren = (
	workInProgress: FiberNode,
	children?: ReactElementType
) => {
	const current = workInProgress.alternate;

	if (current !== null) {
		workInProgress.child = reconcileChildFibers(
			workInProgress,
			current?.child,
			children
		);
	} else {
		workInProgress.child = mountChildFibers(workInProgress, null, children);
	}
};

import { appendInitialChild, Container, createInstance, createTextInstance, Instance } from 'hostConfig';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags } from './fiberFlags';

export const completeWork = (workInProgress: FiberNode) => {
	const newProps = workInProgress.pendingProps;
	const current = workInProgress.alternate;

	switch (workInProgress.tag) {
		case HostRoot:
			bubbleProperties(workInProgress);
			return null;
		case HostComponent:
			if (current !== null && workInProgress.stateNode !== null) {
				// TODO更新阶段
			} else {
				// mount 首屏挂载
				const instance = createInstance(workInProgress.type, newProps);
				appendAllChildren(instance, workInProgress);
				workInProgress.stateNode = instance;
			}
			bubbleProperties(workInProgress);
			return null;
		case HostText:
			if (current !== null && workInProgress.stateNode !== null) {
				// TODO更新阶段
			} else {
				const instance = createTextInstance(newProps.content);
				workInProgress.stateNode = instance;
			}
			bubbleProperties(workInProgress);
			return null;
		default:
			if (__DEV__) {
				console.warn('completeWork未实现的 tag 类型 ->> ', workInProgress);
			}
			return null;
	}
};

export const appendAllChildren = (
	parent: Instance | Container,
	workInProgress: FiberNode
) => {
	let node = workInProgress.child;

	while (node !== null) {
		if (node.tag == HostComponent || node.tag == HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node == workInProgress) {
			return;
		}

		while (node.sibling == null) {
			if (node.return === null || node.return === workInProgress) {
				return;
			}
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
};

export const bubbleProperties = (workInProgress: FiberNode) => {
	let subtreeFlags = NoFlags;
	let child = workInProgress.child;

	while (child != null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = workInProgress;
		child = child.sibling;
	}
	workInProgress.subtreeFlags = subtreeFlags;
};

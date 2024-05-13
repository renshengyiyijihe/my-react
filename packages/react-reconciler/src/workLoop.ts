import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

const renderRoot = (root: FiberRootNode) => {
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (err) {
			console.error('renderRoot workLoop err ->>', err);
			workInProgress = null;
		}
	} while (true);
};

const prepareFreshStack = (root: FiberRootNode) => {
	workInProgress = createWorkInProgress(root.current, {});
};

const workLoop = () => {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
};

const performUnitOfWork = (fiber: FiberNode) => {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next != null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
};

const completeUnitOfWork = (fiber: FiberNode) => {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;
		if (!sibling) {
			workInProgress = sibling;
			return;
		}

		node = node.return;
		workInProgress = node;
	} while (node !== null);
};

export const scheduleUpdateOnFiber = (fiber: FiberNode) => {
	const root = markUpdateFromFiberToRoot(fiber);
	return root;
};

export const markUpdateFromFiberToRoot = (fiber: FiberNode) => {
	let node = fiber;
	while (node.return !== null) {
		node = node.return;
	}

	if (node.tag === HostRoot) {
		return node.stateNode;
	}

	return null;
};

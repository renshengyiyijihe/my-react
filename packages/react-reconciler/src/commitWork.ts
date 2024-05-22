import {
	appendChildToContainer,
	commitUpdate,
	Container,
	insertChildToContainer,
	Instance,
	removeChild
} from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import {
	ChildDeletion,
	MutationMask,
	NoFlags,
	Placement,
	Update
} from './fiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';

let nextEffect: FiberNode | null = null;

export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;

		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);

				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};

export const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
	if ((flags & Update) !== NoFlags) {
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update;
	}
	if ((flags & ChildDeletion) !== NoFlags) {
		const deletions = finishedWork.deletions;

		if (deletions !== null) {
			deletions.forEach((deletion) => {
				commitDeletion(deletion);
			});
		}
		finishedWork.flags &= ~ChildDeletion;
	}
};

export const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.log('执行 Placement 操作', finishedWork);
	}

	const hostParent = getHostParent(finishedWork) as Container;

	const sibling = getHostSibling(finishedWork);

	appendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
};

const commitDeletion = (childToDelete: FiberNode) => {
	if (__DEV__) {
		console.log('执行 Deletion 操作 ->> ', childToDelete);
	}

	// let rootHostNode: FiberNode | null = null;
	let rootChildrenToDelete: FiberNode[] = [];

	commitNestedUnmounts(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				recordChildrenToDelete(rootChildrenToDelete, unmountFiber);
				// if (rootChildrenToDelete === null) {
				// 	rootChildrenToDelete = unmountFiber;
				// }
				// TODO unmount ref
				return;
			case HostText:
				recordChildrenToDelete(rootChildrenToDelete, unmountFiber);
				// if (rootHostNode === null) {
				// 	rootHostNode = unmountFiber;
				// }
				return;
			case FunctionComponent:
				// if (rootChildrenToDelete === null) {
				// 	rootChildrenToDelete = unmountFiber;
				// }
				// TODO unmount ref
				return;
			default:
				if (__DEV__) {
					console.warn('未实现的 commitDeletion 类型 ->> ', unmountFiber);
				}
		}
	});

	if (rootChildrenToDelete !== null) {
		const hostParent = getHostParent(childToDelete) as Container;
		rootChildrenToDelete.forEach((node) => {
			removeChild(node.stateNode, hostParent);
		});
	}

	childToDelete.return = null;
	childToDelete.child = null;
};

function recordChildrenToDelete(
	childrenToDelete: FiberNode[],
	unmountFiber: FiberNode
) {
	let lastOne = childrenToDelete[childrenToDelete.length - 1];
	if (!lastOne) {
		childrenToDelete.push(unmountFiber);
	} else {
		let node = lastOne.sibling;
		while (node !== null) {
			if (lastOne == unmountFiber) {
				childrenToDelete.push(unmountFiber);
			}
			node = node.sibling;
		}
	}
}

const commitNestedUnmounts = (
	root: FiberNode,
	onCommitUnmount: (unmountFiber: FiberNode) => void
) => {
	let node = root;
	while (true) {
		onCommitUnmount(node);

		if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === root) return;

		while (node.sibling === null) {
			if (node.return == null || node.return === root) return;
			node = node.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
};

const getHostParent = (fiber: FiberNode): Container | null => {
	let parent = fiber.return;

	while (parent !== null) {
		const parentTag = parent.tag;

		// Root节点
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}

		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		} else {
			parent = parent.return;
		}
	}

	if (__DEV__) {
		console.warn('未找到 host parent', fiber);
	}

	return null;
};

export const appendPlacementNodeIntoContainer = (
	finishedWork: FiberNode,
	hostParent: Container,
	before?: Instance
) => {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		// 移动
		if (before) {
			insertChildToContainer(finishedWork.stateNode, hostParent, before);
		} else {
			appendChildToContainer(finishedWork.stateNode, hostParent);
		}
	} else {
		const child = finishedWork.child;
		if (child !== null) {
			appendPlacementNodeIntoContainer(child, hostParent);
			let sibling = child.sibling;
			while (sibling !== null) {
				appendPlacementNodeIntoContainer(sibling, hostParent);
				sibling = sibling.sibling;
			}
		}
	}

	// if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
	// 	appendChildToContainer(finishedWork.stateNode, hostParent);
	// } else {
	// 	const child = finishedWork.child;
	// 	if (child !== null) {
	// 		appendPlacementNodeIntoContainer(child, hostParent);
	// 		let sibling = child.sibling;
	// 		while (sibling !== null) {
	// 			appendPlacementNodeIntoContainer(sibling, hostParent);
	// 			sibling = sibling.sibling;
	// 		}
	// 	}
	// }
};

export const getHostSibling = (fiber: FiberNode) => {
	let node: FiberNode = fiber;
	findSibling: while (true) {
		while (node.sibling == null) {
			const parent = node.return;

			if (
				parent == null ||
				parent.tag == HostComponent ||
				parent.tag == HostRoot
			) {
				return null;
			}

			node = parent;
		}

		node.sibling.return = node.return;
		node = node.sibling;

		while (node.tag !== HostText && node.tag !== HostComponent) {
			if ((node.flags & Placement) !== NoFlags) {
				continue findSibling;
			}

			if (node.child == null) {
				continue findSibling;
			} else {
				node.child.return = node;
				node = node.child;
			}
		}

		if ((node.flags & Placement) == NoFlags) {
			return node.stateNode;
		}
	}
};

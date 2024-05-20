import { Props, ReactElementType } from 'shared/ReactTypes';
import {
	createFiberFromElement,
	createWorkInProgress,
	FiberNode
} from './fiber';
import { HostText } from './workTags';
import { ChildDeletion, Placement } from './fiberFlags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

type ExistingChildren = Map<string | number, FiberNode>;

export const ChildReconciler = (shouldTrackSideEffects: boolean) => {
	function updateFromMap(
		returnFiber: FiberNode,
		existingChildren: ExistingChildren,
		index: number,
		element: any
	): FiberNode | null {
		const key = element.key !== null ? element.key : index.toString();
		const before = existingChildren.get(key);

		// HostText
		if (typeof element === 'string' || typeof element === 'number') {
			if (before && before.tag === HostText) {
				existingChildren.delete(key);
				return useFiber(before, { content: element + '' });
			}

			return new FiberNode(HostText, { content: element + '' }, null);
		}

		//HostComponent
		if (typeof element === 'object' && element !== null) {
			switch (element.$$typeof) {
				case REACT_ELEMENT_TYPE:
					if (before && before.type === element.type) {
						existingChildren.delete(key);
						return useFiber(before, element.props);
					}
					return createFiberFromElement(element);
				default:
					if (__DEV__) {
						console.warn(
							'updateFromMap 未实现的react type类型 ->> ',
							element.$$typeof
						);
					}
			}
		}

		// TODO 数组类型的element，如：<ul>{[<li/>, <li/>]}</ul>
		if (Array.isArray(element) && __DEV__) {
			console.warn('还未实现数组类型的child', element);
		}
		return null;
	}

	function reconcileChildrenArray(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild: any[]
	) {
		let lastPlacedIndex: number = 0;
		let firstNewFiber: FiberNode | null = null;
		let lastNewFiber: FiberNode | null = null;

		const existingChildren = new Map();
		let current = currentFirstChild;
		while (current !== null) {
			const key = current.key !== null ? current.key : current.index.toString();
			existingChildren.set(key, current);
			current = current.sibling;
		}

		for (let i = 0, len = newChild.length; i < len; i++) {
			const after = newChild[i];
			const newFiber = updateFromMap(returnFiber, existingChildren, i, after);

			if (newFiber == null) continue;
			newFiber.index = i;
			newFiber.return = returnFiber;

			if (lastNewFiber == null) {
				lastNewFiber = newFiber;
				firstNewFiber = newFiber;
			} else {
				lastNewFiber.sibling = newFiber;
				lastNewFiber = lastNewFiber.sibling;
			}

			if (!shouldTrackSideEffects) continue;

			const current = newFiber.alternate;
			if (current !== null) {
				const oldIndex = current.index;
				if (oldIndex < lastPlacedIndex) {
					newFiber.flags |= Placement;
					continue;
				} else {
					lastPlacedIndex = oldIndex;
				}
			} else {
				newFiber.flags |= Placement;
			}
		}

		existingChildren.forEach((fiber) => {
			deleteChild(returnFiber, fiber);
		});

		return firstNewFiber;
	}

	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	): void {
		if (!shouldTrackSideEffects) return;
		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}

	const useFiber = (fiber: FiberNode, pendingProps: Props): FiberNode => {
		const clone = createWorkInProgress(fiber, pendingProps);
		clone.index = 0;
		clone.sibling = null;

		return clone;
	};

	const deleteChild = (returnFiber: FiberNode, childToDelete: FiberNode) => {
		if (!shouldTrackSideEffects) return;
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	};

	const reconcileSingleElement = (
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) => {
		while (currentFiber !== null) {
			if (currentFiber.key === element.key) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === element.type) {
						const existing = useFiber(currentFiber, element.props);
						existing.return = returnFiber;

						deleteRemainingChildren(returnFiber, currentFiber.sibling);
						return existing;
					}
					deleteRemainingChildren(returnFiber, currentFiber);
					break;
				} else {
					if (__DEV__) {
						console.warn('还未实现的 React 类型', element);
						break;
					}
				}
			} else {
				deleteChild(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
			}
		}

		// if (currentFiber !== null) {
		// 	if (currentFiber.key === element.key) {
		// 		if (element.$$typeof === REACT_ELEMENT_TYPE) {
		// 			if (currentFiber.type === element.type) {
		// 				const existing = useFiber(currentFiber, element.props);
		// 				existing.return = returnFiber;
		// 				return existing;
		// 			}
		// 			deleteChild(returnFiber, currentFiber);
		// 		} else {
		// 			if (__DEV__) {
		// 				console.warn('还未实现的 React 类型', element);
		// 			}
		// 		}
		// 	} else {
		// 		deleteChild(returnFiber, currentFiber);
		// 	}
		// }

		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	};

	const reconcileSingleTextNode = (
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) => {
		// update
		if (currentFiber !== null) {
			if (currentFiber.tag === HostText) {
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				return existing;
			} else {
				deleteChild(returnFiber, currentFiber);
			}
		}

		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	};

	const placeSingleChild = (fiber: FiberNode) => {
		if (shouldTrackSideEffects && fiber.alternate == null) {
			fiber.flags |= Placement;
		}

		return fiber;
	};

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		if (newChild !== null && typeof newChild == 'object') {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);

				default:
					if (__DEV__) {
						console.warn('未实现的 reconcile 类型 ->> ', newChild);
					}
					break;
			}
		}

		if (Array.isArray(newChild)) {
			return reconcileChildrenArray(returnFiber, currentFiber, newChild);
			// if (__DEV__) {
			// 	console.warn('未实现的 reconcile 类型', newChild);
			// }
		}

		if (typeof newChild == 'string' || typeof newChild == 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		if (currentFiber !== null) {
			deleteChild(returnFiber, currentFiber);
		}

		if (__DEV__) {
			console.warn('未实现的 reconcile 类型', newChild);
		}
		return null;
	};
};

export const reconcileChildFibers = ChildReconciler(true);

export const mountChildFibers = ChildReconciler(false);

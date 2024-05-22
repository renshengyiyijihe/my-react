import { FiberRootNode } from './fiber';

export type Lane = number;

export type Lanes = number;

export const NoLane = 0b0000;

export const NoLanes = 0b0000;

export const SyncLane = 0b0001;

export function mergeLanes(laneA: Lane, LaneB: Lane) {
	return laneA | LaneB;
}

export function requestUpdateLane() {
	return SyncLane;
}

export function getHighestPriorityLane(lanes: Lanes): Lane {
	return lanes & -lanes;
}

export function markRootFinished(root: FiberRootNode, lane: Lane) {
	root.pendingLanes &= ~lane;
}

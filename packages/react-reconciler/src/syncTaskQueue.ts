let syncQueue: ((...args: any[]) => void)[] | null = null;

let isFlushingSyncQueue: boolean = false;

export function scheduleSyncCallback(callback: (...args: any[]) => void) {
	if (syncQueue == null) {
		syncQueue = [callback];
	} else {
		syncQueue.push(callback);
	}
}

export function flushSyncCallback() {
	if (!isFlushingSyncQueue && syncQueue) {
		isFlushingSyncQueue = true;
		try {
			syncQueue.forEach((cb) => cb());
		} catch (e) {
			if (__DEV__) {
				console.error('flushSyncCallback 报错', e);
			}
		} finally {
			isFlushingSyncQueue = false;
			syncQueue = null;
		}
	}
}

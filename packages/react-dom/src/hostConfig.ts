export type Container = Element;
export type Instance = Element;

export const createInstance = (
	type: keyof HTMLElementTagNameMap,
	props: any
): Instance => {
	const element = document.createElement(type);
	return element;
};

export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};

export const createTextInstance = (content: string) => {
	const element = document.createTextNode(content);
	return element;
};

export const appendChildToContainer = (
	child: Instance,
	parent: Instance | Container,
) => {
	parent.appendChild(child);
};

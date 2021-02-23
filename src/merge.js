import mergeWith from "lodash/mergeWith";

function customizer(prevValue, newValue) {
	if (newValue?._replace) {
		// eslint-disable-next-line no-unused-vars
		const { _replace, ...rest } = newValue;
		return Array.isArray(newValue) ? Object.values(rest) : rest;
	}
	if (Array.isArray(prevValue)) return prevValue.concat(newValue);
}

export const mergeStrategies = {
	arrayReplace: (prevArr, newArr) => {
		if (prevArr === undefined) return newArr;
		if (Array.isArray(prevArr) && Array.isArray(newArr)) return newArr;
		return undefined;
	},
	arrayAppend: (prevArr, newArr) => {
		if (prevArr === undefined) return newArr;
		if (Array.isArray(prevArr) && Array.isArray(newArr))
			return prevArr.concat(newArr);
		return undefined;
	}
};

export const merge = (...args) => mergeWith({}, ...args, customizer);

export const willReplace = (target) => {
	target._replace = true;
	return target;
};

export const willConcat = (target) => {
	target._replace = true;
	return target;
};

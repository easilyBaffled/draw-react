import React, { useReducer, useState } from "react";
import { v4 as uuid } from "uuid";
import { merge } from "./merge";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

const sample = (arr) => {
	const i = Math.min(Math.floor(Math.random() * 10), arr.length);
	return arr[i];
};

/**
 * Flatten deep and complex if/ternary operations
 * @param {Object.<boolean, function>} obj
 * @return {*}
 */
export const match = (obj) => obj[true]();

const payloadUnpacker = (payload) =>
	match({
		true: () => payload,
		[payload.length === 0]: () => undefined,
		[payload.length === 1]: () => payload[0]
	});

export const createActions = (updaters, dispatch) =>
	Object.keys(updaters).reduce(
		(acc, type) => ({
			...acc,
			[type]: (...payload) =>
				dispatch({
					type,
					payload: payloadUnpacker(payload)
				})
		}),
		{}
	);
export const initialLayout = {
	root: {
		id: "root",
		type: "div",
		props: { className: "App test" },
		children: ["ul"]
	}
};

const componentTemplate = {
	id: null,
	type: "div",
	props: {},
	children: []
};

class Component {
	static addChild(parent, newChild) {
		return {
			...parent,
			children: parent.children.concat(newChild.id)
		};
	}

	static removeChild(parent, childId) {
		return {
			...parent,
			children: parent.children.filter((id) => id !== childId)
		};
	}

	static setProp(cmp, props) {
		return merge(cmp, { props });
	}
}

const actors = {
	addComponent(layout, { type, parentId = "root" }) {
		const newComponent = { ...componentTemplate, id: uuid(), type };

		return {
			...layout,
			[parentId]: Component.addChild(layout[parentId], newComponent),
			[newComponent.id]: newComponent
		};
	},
	removeComponent: (layout, { id, parentId }) => {
		const { [id]: __, ...newLayout } = layout;
		const parentCmp = newLayout[parentId];
		console.log(
			newLayout,
			layout,
			parentCmp,
			Component.removeChild(parentCmp),
			id
		);
		return {
			...newLayout,
			[parentId]: Component.removeChild(parentCmp, id)
		};
	},
	setProp: (layout, { id, ...props }) => {
		const cmp = layout[id];

		merge(layout, { [id]: Component.setProp(cmp, props) });
	}
};

const layoutReducer = (layout, { type, payload }) => {
	return actors[type]?.(layout, payload) ?? layout;
};

export const useLayout = (typeList, flatLayout = initialLayout) => {
	const [state, dispatch] = useReducer(layoutReducer, flatLayout);

	const actions = createActions(actors, dispatch);

	const EntryControl = ({ children, parentId, id }) => {
		const [mouseOver, setHover] = useState(false);
		const [mouseOverControls, setMouseOverControls] = useState(false);

		return (
			<div
				className="entity-control-container"
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setTimeout(() => setHover(false), 250)}
			>
				{(mouseOver || mouseOverControls) && (
					<div
						className="entity-controls"
						onMouseEnter={() => setMouseOverControls(true)}
						onMouseLeave={() =>
							setTimeout(() => setMouseOverControls(false), 250)
						}
					>
						<pre>
							<code>{children.type}</code>
						</pre>
						<Autocomplete
							options={Object.keys(typeList)}
							onChange={(e, value, reason) => {
								console.log(e, reason);
								if (reason === "select-option")
									actions.addComponent({
										parentId: id,
										type: value
									});
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Combo box"
									variant="outlined"
								/>
							)}
						/>

						<button
							onClick={() =>
								actions.removeComponent({ id, parentId })
							}
						>
							-
						</button>
						<button
							onClick={() =>
								actions.setProp({
									id,
									style: {
										color: sample(
											"red",
											"blue",
											"gree",
											"tomato",
											"teal"
										)
									}
								})
							}
						>
							set color
						</button>
					</div>
				)}
				{children}
			</div>
		);
	};

	const FlatLayoutComponent = ({
		id,
		parentId,
		type,
		props,
		children,
		layout
	}) => {
		const Cmp = typeList[type] ?? type;
		return (
			<EntryControl id={id} parentId={parentId}>
				<Cmp key={id} {...props}>
					{children.length
						? children.map((childId) => {
								const data = layout[childId];

								return typeof data === "object" ? (
									<FlatLayoutComponent
										key={childId}
										parentId={id}
										layout={layout}
										{...data}
									/>
								) : (
									data ?? childId
								);
						  })
						: undefined}
				</Cmp>
			</EntryControl>
		);
	};

	return { layout: state, ...actions, FlatLayoutComponent, EntryControl };
};

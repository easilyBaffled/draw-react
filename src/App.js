import React from "react";
import * as MaterialUI from "@material-ui/core";
import { v4 as uuid } from "uuid";
import { serialize } from "./react-serialize";
import "./styles.scss";
import { useLayout, initialLayout } from "./cmp-tree";

const exampleState = {
	layout: [
		{
			id: uuid(),
			type: "div",
			props: { className: "App" },
			children: [
				{
					id: uuid(),
					type: "ul",
					props: {},
					children: [
						{
							id: uuid(),
							type: "li",
							props: {},
							children: [
								{
									id: uuid(),
									type: "Checkbox",
									props: {
										checked: false
									},
									children: []
								},
								{
									id: uuid(),
									type: "p",
									props: {},
									children: ["a"]
								}
							]
						}
					]
				}
			]
		}
	]
};

const flatLayout = {
	...initialLayout,
	ul: {
		id: "ul",
		type: "ul",
		props: {},
		children: ["li_a"]
	},
	li_a: {
		id: "li_a",
		type: "li",
		props: {},
		children: ["li_a_checkbox", "li_a_text_a"]
	},
	li_a_checkbox: {
		id: "li_a_checkbox",
		type: "Checkbox",
		props: {
			checked: false
		},
		children: []
	},
	li_a_text_a: {
		id: "li_a_text_a",
		type: "p",
		props: {},
		children: ["a"]
	}
};

const _taskList = [
	{ label: "a", completed: false },
	{ label: "b", completed: false },
	{ label: "c", completed: false }
];

const updateWhen = (matchingPredicate, updateObj) => (listItem) =>
	matchingPredicate(listItem) ? { ...listItem, ...updateObj } : listItem;

const Input = (props) => <input {...props} />;
const Checkbox = (props) => <Input {...props} type="checkbox" />;

const TaskItem = ({ label, compelted }) => (
	<li>
		<Checkbox checked={compelted} />
		<p>{label}</p>
	</li>
);

const TodoList = ({ list, updateTask }) => (
	<ul>
		{list.map((item, i) => (
			<TaskItem
				key={item.label + "-i"}
				{...item}
				toggleStatus={() =>
					updateTask(item.label, { compelted: !item.compelted })
				}
			/>
		))}
	</ul>
);

const typeList = {
	Input,
	...Object.entries(MaterialUI).reduce(
		(acc, [k, v]) => (/^[A-Z]/.test(k) ? { ...acc, [k]: v } : acc),
		{}
	)
};

console.log(typeList);

const LayoutComponent = ({ id, type, props, children }) => {
	const Cmp = typeList[type] ?? type;
	return (
		<Cmp key={id} {...props}>
			{children.length
				? children.map((data) =>
						typeof data === "object" ? (
							<LayoutComponent key={data.id} {...data} />
						) : (
							data
						)
				  )
				: undefined}
		</Cmp>
	);
};

export default function App() {
	const { layout, FlatLayoutComponent } = useLayout(typeList, flatLayout);

	const [taskList, setTaskList] = React.useState(_taskList);
	const updateTask = (label, updateObject) =>
		setTaskList(
			updateWhen((taskItem) => taskItem.label === label, updateObject)
		);

	return (
		<>
			<div className="App">
				<TodoList list={taskList} updateTask={updateTask} />
			</div>
			{exampleState.layout.map((data) => (
				<LayoutComponent key={data.id} {...data} />
			))}
			<FlatLayoutComponent layout={layout} {...layout.root} />
		</>
	);
}

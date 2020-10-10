import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { findItemIndexById } from './utils/findItemIndexById';
import { moveItem } from './utils/moveItem';
import { DragItem } from './DragItem';
import { save } from './api';
import { withData } from './withData';

type Action =
	| {
			type: 'ADD_LIST';
			payload: string;
	  }
	| {
			type: 'ADD_TASK';
			payload: { text: string; listId: string };
	  }
	| {
			type: 'MOVE_LIST';
			payload: {
				dragIndex: number;
				hoverIndex: number;
			};
	  }
	| {
			type: 'SET_DRAGGED_ITEM';
			payload: DragItem | undefined;
	  }
	| {
			type: 'MOVE_TASK';
			payload: {
				dragIndex: number;
				hoverIndex: number;
				sourceColumn: string;
				targetColumn: string;
			};
	  };

interface AppStateContextProps {
	state: AppState;
	dispatch: React.Dispatch<Action>;
}

interface List {
	id: string;
	text: string;
	tasks: Task[];
}

interface Task {
	id: string;
	text: string;
}

const appStateReducer = (state: AppState, action: Action): AppState => {
	switch (action.type) {
		case 'ADD_LIST': {
			return {
				...state,
				lists: [
					...state.lists,
					{ id: nanoid(), text: action.payload, tasks: [] },
				],
			};
		}
		case 'ADD_TASK': {
			const targetLaneIndex = findItemIndexById(
				state.lists,
				action.payload.listId
			);
			state.lists[targetLaneIndex].tasks.push({
				id: nanoid(),
				text: action.payload.text,
			});

			return {
				...state,
			};
		}
		case 'MOVE_LIST': {
			const { dragIndex, hoverIndex } = action.payload;
			state.lists = moveItem(state.lists, dragIndex, hoverIndex);
			return { ...state };
		}
		case 'SET_DRAGGED_ITEM': {
			return { ...state, draggedItem: action.payload };
		}
		case 'MOVE_TASK': {
			const {
				dragIndex,
				hoverIndex,
				sourceColumn,
				targetColumn,
			} = action.payload;
			const sourceLaneIndex = findItemIndexById(
				state.lists,
				sourceColumn
			);
			const targetLaneIndex = findItemIndexById(
				state.lists,
				targetColumn
			);
			const item = state.lists[sourceLaneIndex].tasks.splice(
				dragIndex,
				1
			)[0];
			state.lists[targetLaneIndex].tasks.splice(hoverIndex, 0, item);
			return { ...state };
		}
		default: {
			return state;
		}
	}
};

// const appData: AppState = {
// 	lists: [],
// 	draggedItem: undefined,
// };

const AppStateContext = createContext<AppStateContextProps>(
	{} as AppStateContextProps
);

export interface AppState {
	lists: List[];
	draggedItem: DragItem | undefined;
}

export const AppStateProvider = withData(
	({
		children,
		initialState,
	}: React.PropsWithChildren<{ initialState: AppState }>) => {
		const [state, dispatch] = useReducer(appStateReducer, initialState);
		useEffect(() => {
			save(state);
		}, [state]);
		return (
			<AppStateContext.Provider value={{ state, dispatch }}>
				{children}
			</AppStateContext.Provider>
		);
	}
);

export const useAppState = () => {
	return useContext(AppStateContext);
};

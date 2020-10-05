import React, { PropsWithChildren, ComponentType, useState } from 'react';
import { load } from './api';
import { AppState } from './AppStateContext';

export const withData = (
	WrappedComponent: ComponentType<
		PropsWithChildren<{ initialState: AppState }>
	>
) => {
	return ({ children }: PropsWithChildren<{}>) => {
		const [isLoading, setIsLoading] = useState(true);
		const [error, setError] = useState<Error | undefined>();
		const [initialState, setInitialState] = useState<AppState>({
			lists: [],
			draggedItem: undefined,
		});

		React.useEffect(() => {
			const fetchInitialState = async () => {
				try {
					const data = await load();
					setInitialState(data);
				} catch (e) {
					setError(e);
				}
				setIsLoading(false);
			};
			fetchInitialState();
		}, []);

		return (
			<WrappedComponent initialState={initialState}>
				{children}
			</WrappedComponent>
		);
	};
};

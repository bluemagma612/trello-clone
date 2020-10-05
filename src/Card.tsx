import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { useAppState } from './AppStateContext';
import { CardDragItem } from './DragItem';
import { CardContainer } from './styles';
import { useItemDrag } from './utils/useItemDrag';
import { isHidden } from './utils/IsHidden';

interface CardProps {
	text: string;
	index: number;
	columnId: string;
	isPreview?: boolean;
	id: string;
}

export const Card = ({ text, index, columnId, id, isPreview }: CardProps) => {
	const { state, dispatch } = useAppState();

	const ref = useRef<HTMLDivElement>(null);

	const [, drop] = useDrop({
		accept: 'CARD',
		hover(item: CardDragItem) {
			if (item.id === id) {
				return;
			}

			const dragIndex = item.index;
			const hoverIndex = index;
			const sourceColumn = item.columnId;
			const targetColumn = columnId;

			dispatch({
				type: 'MOVE_TASK',
				payload: { dragIndex, hoverIndex, sourceColumn, targetColumn },
			});
			item.index = hoverIndex;
			item.columnId = targetColumn;
		},
	});

	const { drag } = useItemDrag({ type: 'CARD', id, index, text, columnId });

	drag(drop(ref));

	return (
		<CardContainer
			isHidden={isHidden(isPreview, state.draggedItem, 'CARD', id)}
			isPreview={isPreview}
			ref={ref}>
			{text}
		</CardContainer>
	);
};

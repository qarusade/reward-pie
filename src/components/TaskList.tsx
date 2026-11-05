import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type Modifier,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties } from 'react';
import { useStore } from '../store/store';
import type { Task } from '../types';
import { CheckIcon, GripIcon, TrashIcon } from './Icon';

/** Двигаем только вверх-вниз, чтобы задача не уезжала вбок. */
const onlyVertical: Modifier = ({ transform }) => ({ ...transform, x: 0 });

const instructions: ScreenReaderInstructions = {
  draggable:
    'Чтобы переставить задачу, нажми пробел или Enter. Стрелками вверх и вниз выбери место, ' +
    'пробелом или Enter поставь. Esc — отмена.',
};

/** Задачи одной категории за один день. Порядок меняется перетаскиванием за ручку слева. */
export function TaskList({ tasks }: { tasks: Task[] }) {
  const moveTask = useStore((s) => s.moveTask);
  const sensors = useSensors(
    // Мышь и палец: перетаскивание начинается, когда ручку сдвинули на 4px, — простой тап ничего не ломает.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const title = (id: UniqueIdentifier) => `«${tasks.find((t) => t.id === id)?.title ?? ''}»`;
  const place = (id: UniqueIdentifier) => `место ${tasks.findIndex((t) => t.id === id) + 1} из ${tasks.length}`;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Задача ${title(active.id)} взята, ${place(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `Задача ${title(active.id)}: ${place(over.id)}.` : `Задача ${title(active.id)} вне списка.`,
    onDragEnd: ({ active, over }) =>
      over ? `Задача ${title(active.id)} поставлена на ${place(over.id)}.` : `Задача ${title(active.id)} осталась на месте.`,
    onDragCancel: ({ active }) => `Отмена. Задача ${title(active.id)} осталась на месте.`,
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) moveTask(String(active.id), String(over.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[onlyVertical]}
      onDragEnd={onDragEnd}
      accessibility={{ announcements, screenReaderInstructions: instructions }}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="tasks">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function TaskRow({ task }: { task: Task }) {
  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    attributes: { roleDescription: 'перетаскиваемая задача' },
  });
  const style: CSSProperties = { transform: CSS.Translate.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className={isDragging ? 'task task--dragging' : 'task'}>
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="task__grip"
        aria-label={`Переставить задачу «${task.title}»`}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>
      <button type="button" className="task__toggle" aria-pressed={task.done} onClick={() => toggleTask(task.id)}>
        <span className="task__box">{task.done && <CheckIcon />}</span>
        <span className="task__title">{task.title}</span>
      </button>
      <button
        type="button"
        className="icon-btn task__delete"
        aria-label={`Удалить задачу «${task.title}»`}
        onClick={() => {
          if (window.confirm(`Удалить задачу «${task.title}»?`)) deleteTask(task.id);
        }}
      >
        <TrashIcon />
      </button>
    </li>
  );
}

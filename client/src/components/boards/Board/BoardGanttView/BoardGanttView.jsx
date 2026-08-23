/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { dequal } from 'dequal';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Button, Dropdown, Icon, Popup } from 'semantic-ui-react';
import toast from 'react-hot-toast';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import { getCachedDate, hasCircularDependency } from '../../../../utils/gantt';

import styles from './BoardGanttView.module.scss';

const safeToISOString = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const BoardGanttView = React.memo(({ cardIds }) => {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedDependencyId, setSelectedDependencyId] = useState('');

  const boardMembership = useSelector(selectors.selectCurrentUserMembershipForCurrentBoard);
  const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

  // Retrieve cards and map dependencies with deep equality comparison
  const cards = useSelector(
    (state) =>
      cardIds.map((id) => {
        const card = selectors.selectCardById(state, id);
        const dependencyIds = selectors.selectDependencyCardIdsByCardId(state, id) || [];
        const progress = selectors.selectCardProgressByCardId(state, id) || 0;
        return {
          id: card ? card.id : id,
          name: card ? card.name : '',
          startDate: card && card.startDate ? safeToISOString(card.startDate) : null,
          dueDate: card && card.dueDate ? safeToISOString(card.dueDate) : null,
          createdAt: card && card.createdAt ? safeToISOString(card.createdAt) : null,
          isDueCompleted: card ? !!card.isDueCompleted : false,
          dependencyIds,
          progress,
        };
      }),
    dequal,
  );

  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const prevGanttTasksRef = useRef([]);
  const prevCanonicalTasksRef = useRef([]);
  const updateTimeoutRef = useRef(null);
  // Lock mechanism: when a date change is dispatched, freeze ganttTasks output
  // to prevent gantt-task-react's internal useEffect from cascading into an infinite loop
  const [isUpdating, setIsUpdating] = useState(false);
  const unlockTimeoutRef = useRef(null);

  // Build dependency map for circular dependency checks
  const dependenciesMap = useMemo(() => {
    const map = {};
    cards.forEach((card) => {
      map[String(card.id)] = card.dependencyIds.map((id) => String(id));
    });
    return map;
  }, [cards]);

  // Map Planka cards to gantt-task-react Task interface with stable reference guarantee
  const ganttTasks = useMemo(() => {
    // While a date change dispatch is in flight, return stale tasks to prevent
    // gantt-task-react from entering a useEffect → setState infinite loop
    if (isUpdating && prevGanttTasksRef.current.length > 0) {
      return prevGanttTasksRef.current;
    }

    if (!cards || cards.length === 0) {
      prevGanttTasksRef.current = [];
      prevCanonicalTasksRef.current = [];
      return [];
    }

    const validCardIds = new Set(cards.map((c) => String(c.id)));

    const canonicalTasks = cards.map((card) => {
      const rawStart = card.startDate || card.createdAt;
      let start = getCachedDate(rawStart);
      if (!start) {
        start = getCachedDate(Date.now());
      }

      let end;
      if (card.dueDate) {
        end = getCachedDate(card.dueDate);
      } else {
        end = getCachedDate(start.getTime() + 24 * 60 * 60 * 1000);
      }

      if (end.getTime() <= start.getTime()) {
        end = getCachedDate(start.getTime() + 24 * 60 * 60 * 1000);
      }

      // Filter out invalid, non-existent, self, or circular dependencies that cause gantt-task-react errors
      const safeDependencies = Array.from(
        new Set(
          card.dependencyIds
            .map((depId) => String(depId))
            .filter(
              (depId) =>
                validCardIds.has(depId) &&
                depId !== String(card.id) &&
                !hasCircularDependency(card.id, depId, dependenciesMap),
            ),
        ),
      );

      const isAllTasksCompleted = card.progress === 100;
      const progressColor = isAllTasksCompleted ? styles.progressSuccess : styles.progressBlue;
      const progressSelectedColor = isAllTasksCompleted
        ? styles.progressSuccessActive
        : styles.progressBlueActive;

      const taskStyles = card.isDueCompleted
        ? {
            backgroundColor: styles.dueCompletedBg,
            backgroundSelectedColor: styles.dueCompletedBgSelected,
            progressColor,
            progressSelectedColor,
          }
        : {
            progressColor,
            progressSelectedColor,
          };

      return {
        id: String(card.id),
        name: card.name || '',
        start,
        end,
        progress: card.progress || 0,
        dependencies: safeDependencies,
        type: 'task',
        isDisabled: !isEditor,
        styles: taskStyles,
      };
    });

    // Compare canonical task properties with previous render to prevent reference changes
    const isSame =
      prevCanonicalTasksRef.current.length === canonicalTasks.length &&
      canonicalTasks.every((task, index) => {
        const prev = prevCanonicalTasksRef.current[index];
        if (!prev) return false;
        return (
          task.id === prev.id &&
          task.name === prev.name &&
          task.progress === prev.progress &&
          task.isDisabled === prev.isDisabled &&
          task.type === prev.type &&
          task.start.getTime() === prev.start.getTime() &&
          task.end.getTime() === prev.end.getTime() &&
          dequal(task.styles, prev.styles) &&
          dequal(task.dependencies, prev.dependencies)
        );
      });

    if (isSame && prevGanttTasksRef.current.length > 0) {
      return prevGanttTasksRef.current;
    }

    // Deep clone tasks so internal mutations by gantt-task-react don't corrupt state
    const newGanttTasks = canonicalTasks.map((task) => ({
      ...task,
      dependencies: [...task.dependencies],
      styles: { ...task.styles },
    }));

    prevCanonicalTasksRef.current = canonicalTasks;
    prevGanttTasksRef.current = newGanttTasks;
    return newGanttTasks;
  }, [cards, isEditor, dependenciesMap, isUpdating]);

  // Handle date change when dragging or resizing bars in Gantt (stable callback reference)
  const handleDateChange = useCallback(
    (task) => {
      if (!isEditor || !task || !task.id) return;

      const safeDate = (val) => {
        if (!val) return null;
        const d = val instanceof Date ? val : new Date(val);
        return Number.isNaN(d.getTime()) ? null : d;
      };

      const currentCards = cardsRef.current;
      const currentCard = currentCards.find((c) => String(c.id) === String(task.id));
      if (currentCard) {
        const origStart = safeDate(currentCard.startDate || currentCard.createdAt);
        const origEnd = safeDate(currentCard.dueDate);

        const newStart = safeDate(task.start);
        const newEnd = safeDate(task.end);

        const origStartMs = origStart ? origStart.getTime() : 0;
        const origEndMs = origEnd ? origEnd.getTime() : 0;

        const newStartMs = newStart ? newStart.getTime() : 0;
        const newEndMs = newEnd ? newEnd.getTime() : 0;

        // Skip dispatch if both start and end timestamps match existing values
        if (newStartMs === origStartMs && newEndMs === origEndMs) {
          return;
        }
      }

      const startDateObj = safeDate(task.start);
      const dueDateObj = safeDate(task.end);

      const startDate = startDateObj ? startDateObj.toISOString() : null;
      const dueDate = dueDateObj ? dueDateObj.toISOString() : null;

      // Activate update lock: freeze ganttTasks output to prevent infinite re-render loop
      setIsUpdating(true);

      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        dispatch(
          entryActions.updateCard(task.id, {
            startDate,
            dueDate,
          }),
        );

        // Release the lock after gantt-task-react has had time to settle
        unlockTimeoutRef.current = setTimeout(() => {
          setIsUpdating(false);
        }, 300);
      }, 50);
    },
    [dispatch, isEditor],
  );

  // Handle clicking a task in Gantt
  const handleTaskClick = useCallback((task) => {
    if (task && task.id) {
      setSelectedCardId(String(task.id));
    }
  }, []);

  // Handle adding a dependency interactively
  const handleAddDependency = useCallback(() => {
    if (!selectedCardId || !selectedDependencyId) return;

    if (selectedCardId === selectedDependencyId) {
      toast.error('Una tarjeta no puede depender de sí misma');
      return;
    }

    const currentCards = cardsRef.current;
    const selectedCard = currentCards.find((c) => String(c.id) === String(selectedCardId));
    if (
      selectedCard &&
      selectedCard.dependencyIds.map(String).includes(String(selectedDependencyId))
    ) {
      toast.error('Esta dependencia ya existe');
      return;
    }

    if (hasCircularDependency(selectedCardId, selectedDependencyId, dependenciesMap)) {
      toast.error('Dependencia circular detectada. No se puede añadir esta relación.');
      return;
    }

    dispatch(entryActions.createCardDependency(selectedCardId, selectedDependencyId));
    toast.success('Dependencia añadida correctamente');
    setSelectedDependencyId('');
  }, [selectedCardId, selectedDependencyId, dependenciesMap, dispatch]);

  // Handle deleting a dependency
  const handleDeleteDependency = useCallback(
    (cardId, dependencyCardId) => {
      dispatch(entryActions.deleteCardDependency(cardId, dependencyCardId));
      toast.success('Dependencia eliminada');
    },
    [dispatch],
  );

  const selectedCardsDependencies = useMemo(() => {
    if (!selectedCardId) return [];
    const selectedCard = cards.find((c) => String(c.id) === String(selectedCardId));
    if (!selectedCard) return [];
    return selectedCard.dependencyIds
      .map((depId) => {
        const depCard = cards.find((c) => String(c.id) === String(depId));
        return depCard ? { id: String(depCard.id), name: depCard.name } : null;
      })
      .filter(Boolean);
  }, [cards, selectedCardId]);

  const cardOptions = useMemo(
    () =>
      cards.map((c) => ({
        key: String(c.id),
        value: String(c.id),
        text: c.name,
      })),
    [cards],
  );

  if (ganttTasks.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyState}>
          <Icon name="align left" size="huge" />
          <p>No hay tarjetas disponibles para mostrar en el diagrama de Gantt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.modeGroup}>
          <Button
            size="tiny"
            active={viewMode === ViewMode.Day}
            onClick={() => setViewMode(ViewMode.Day)}
          >
            Día
          </Button>
          <Button
            size="tiny"
            active={viewMode === ViewMode.Week}
            onClick={() => setViewMode(ViewMode.Week)}
          >
            Semana
          </Button>
          <Button
            size="tiny"
            active={viewMode === ViewMode.Month}
            onClick={() => setViewMode(ViewMode.Month)}
          >
            Mes
          </Button>
        </div>

        {isEditor && (
          <div className={styles.dependencyControls}>
            <div className={styles.dependencyForm}>
              <span>Dependencia:</span>
              <Dropdown
                placeholder="Tarjeta dependiente"
                selection
                compact
                options={cardOptions}
                value={selectedCardId}
                onChange={(_, { value }) => setSelectedCardId(String(value))}
              />
              <span>depende de</span>
              <Dropdown
                placeholder="Tarjeta bloqueante"
                selection
                compact
                options={cardOptions.filter((opt) => opt.value !== selectedCardId)}
                value={selectedDependencyId}
                onChange={(_, { value }) => setSelectedDependencyId(String(value))}
              />
              <Button
                primary
                size="tiny"
                disabled={!selectedCardId || !selectedDependencyId}
                onClick={handleAddDependency}
              >
                Añadir Dependencia
              </Button>
            </div>
            {selectedCardsDependencies.length > 0 && (
              <div className={styles.dependencyList}>
                <span className={styles.dependencyListLabel}>Depende de:</span>
                {selectedCardsDependencies.map((dep) => (
                  <span key={dep.id} className={styles.dependencyTag}>
                    {dep.name}
                    <Icon
                      name="close"
                      className={styles.deleteIcon}
                      onClick={() => handleDeleteDependency(selectedCardId, dep.id)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.ganttContainer}>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleDateChange}
          onClick={handleTaskClick}
          listCellWidth="200px"
          columnWidth={60}
          locale="es"
        />
      </div>
    </div>
  );
});

BoardGanttView.propTypes = {
  cardIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BoardGanttView;

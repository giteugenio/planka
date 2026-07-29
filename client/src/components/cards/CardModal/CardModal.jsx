/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import { isDoneList, isListArchiveOrTrash } from '../../../utils/record-helpers';
import { isActiveTextElement } from '../../../utils/element-helpers';
import Paths from '../../../constants/Paths';
import { ActivityTypes, BoardMembershipRoles, CardTypes } from '../../../constants/Enums';
import ProjectContent from './ProjectContent';
import StoryContent from './StoryContent';
import AddAttachmentZone from './AddAttachmentZone';

import styles from './CardModal.module.scss';

const DIRECTION_BY_KEY = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

const CardModal = React.memo(() => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const card = useSelector(selectors.selectCurrentCard);
  const prevCardId = useSelector(selectors.selectPrevCardId);

  const canEdit = useSelector((state) => {
    const list = selectListById(state, card.listId);

    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const availableLists = useSelector(selectors.selectAvailableListsForCurrentBoard);

  const cardActivities = useSelector(selectors.selectActivitiesForCurrentCard);

  const dispatch = useDispatch();

  const isCardInDoneList = useMemo(() => {
    if (!card || !availableLists) {
      return false;
    }

    const doneList = availableLists.find(isDoneList);

    return !!(doneList && card.listId === doneList.id);
  }, [card, availableLists]);

  const handleDone = useCallback(() => {
    if (!card || !availableLists) {
      return;
    }

    const doneList = availableLists.find(isDoneList);

    const isInDone = doneList && card.listId === doneList.id;

    if (isInDone) {
      const moveActivity = cardActivities.find(
        (activity) =>
          activity.type === ActivityTypes.MOVE_CARD &&
          activity.data &&
          activity.data.fromList &&
          activity.data.fromList.id &&
          activity.data.fromList.id !== doneList.id,
      );

      let targetListId = (moveActivity && moveActivity.data.fromList.id) || card.prevListId;
      if (!targetListId || (doneList && targetListId === doneList.id)) {
        const fallbackList = availableLists.find((list) => !doneList || list.id !== doneList.id);
        targetListId = fallbackList ? fallbackList.id : null;
      }

      if (targetListId) {
        dispatch(entryActions.moveCard(card.id, targetListId));
      }
    } else if (doneList) {
      dispatch(entryActions.moveCard(card.id, doneList.id));
    }
  }, [card, availableLists, cardActivities, dispatch]);

  const handleClose = useCallback(() => {
    dispatch(push(Paths.BOARDS.replace(':id', card.boardId)));
  }, [card.boardId, dispatch]);

  const handlePrevClick = useCallback(() => {
    dispatch(push(Paths.CARDS.replace(':id', prevCardId)));
  }, [prevCardId, dispatch]);

  const [ClosableModal, isClosableActiveRef] = useClosableModal();

  useEffect(() => {
    const handleKeydown = (event) => {
      if (isClosableActiveRef.current) {
        return;
      }

      if (isActiveTextElement(event.target)) {
        return;
      }

      if (!Object.keys(DIRECTION_BY_KEY).includes(event.key)) {
        return;
      }

      event.preventDefault();
      dispatch(entryActions.goToAdjacentCard(DIRECTION_BY_KEY[event.key]));
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [card, dispatch, isClosableActiveRef]);

  let Content;
  switch (card.type) {
    case CardTypes.PROJECT:
      Content = ProjectContent;

      break;
    case CardTypes.STORY:
      Content = StoryContent;

      break;
    default:
  }

  return (
    <ClosableModal
      closeIcon
      centered={false}
      className={classNames(styles.wrapper, card.type === CardTypes.STORY && styles.wrapperStory)}
      onClose={handleClose}
    >
      <Icon name={isCardInDoneList ? 'undo' : 'check'} className={styles.doneIcon} onClick={handleDone} />
      {prevCardId && (
        <button type="button" className={styles.prevButton} onClick={handlePrevClick}>
          <Icon fitted name="arrow left" size="large" className={styles.prevButtonIcon} />
        </button>
      )}
      {canEdit ? (
        <AddAttachmentZone>
          <Content onClose={handleClose} />
        </AddAttachmentZone>
      ) : (
        <Content onClose={handleClose} />
      )}
    </ClosableModal>
  );
});

export default CardModal;

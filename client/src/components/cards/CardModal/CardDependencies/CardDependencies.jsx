/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { BoardMembershipRoles, ListTypes } from '../../../../constants/Enums';
import Item from './Item';

import styles from './CardDependencies.module.scss';

const CardDependencies = React.memo(() => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const currentCard = useSelector(selectors.selectCurrentCard);
  const blockingCardIds = useSelector(selectors.selectDependentCardIdsForCurrentCard);
  const blockedByCardIds = useSelector(selectors.selectDependencyCardIdsForCurrentCard);

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    if (!boardMembership || boardMembership.role !== BoardMembershipRoles.EDITOR) {
      return false;
    }
    const currentCardModel = selectors.selectCurrentCard(state);
    if (!currentCardModel) return false;
    const list = selectListById(state, currentCardModel.listId);
    if (!list || list.type === ListTypes.ARCHIVE || list.type === ListTypes.TRASH) {
      return false;
    }
    return true;
  });

  const handleDeleteBlocking = useCallback(
    (cardId) => {
      // currentCard is dependencyCardId, cardId is the dependent card
      dispatch(entryActions.deleteCardDependency(cardId, currentCard.id));
    },
    [currentCard, dispatch],
  );

  const handleDeleteBlockedBy = useCallback(
    (dependencyCardId) => {
      // currentCard is cardId, dependencyCardId is the blocking card
      dispatch(entryActions.deleteCardDependency(currentCard.id, dependencyCardId));
    },
    [currentCard, dispatch],
  );

  if (blockingCardIds.length === 0 && blockedByCardIds.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.moduleWrapper}>
        <Icon name="arrows alternate horizontal" className={styles.moduleIcon} />
        <div className={styles.moduleHeader}>{t('common.dependencies')}</div>
        {blockingCardIds.length > 0 && (
          <div className={styles.section}>
            <div className={styles.subHeader}>
              <Icon name="hand paper outline" className={styles.subHeaderIcon} />
              <span className={styles.subHeaderText}>{t('common.blocking')}</span>
              <span className={styles.countBadge}>{blockingCardIds.length}</span>
            </div>
            <div className={styles.items}>
              {blockingCardIds.map((cardId) => (
                <Item
                  key={cardId}
                  id={cardId}
                  onDelete={canEdit ? handleDeleteBlocking : undefined}
                />
              ))}
            </div>
          </div>
        )}
        {blockedByCardIds.length > 0 && (
          <div className={styles.section}>
            <div className={styles.subHeader}>
              <Icon name="ban" className={styles.subHeaderIcon} />
              <span className={styles.subHeaderText}>{t('common.blockedBy')}</span>
              <span className={styles.countBadge}>{blockedByCardIds.length}</span>
            </div>
            <div className={styles.items}>
              {blockedByCardIds.map((cardId) => (
                <Item
                  key={cardId}
                  id={cardId}
                  onDelete={canEdit ? handleDeleteBlockedBy : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default CardDependencies;

/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import Paths from '../../../../constants/Paths';
import { CardTypeIcons } from '../../../../constants/Icons';

import styles from './Item.module.scss';

const Item = React.memo(({ id, onDelete }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const card = useSelector((state) => selectCardById(state, id));

  const handleDeleteClick = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (onDelete) {
        onDelete(id);
      }
    },
    [id, onDelete],
  );

  if (!card) {
    return null;
  }

  const iconName = CardTypeIcons[card.type] || 'credit card outline';

  return (
    <div className={styles.wrapper}>
      <Link to={Paths.CARDS.replace(':id', id)} className={styles.link}>
        <Icon name={iconName} className={styles.icon} />
        <span className={styles.name}>{card.name}</span>
      </Link>
      {onDelete && (
        <Button
          type="button"
          icon="close"
          size="mini"
          className={styles.deleteButton}
          onClick={handleDeleteClick}
        />
      )}
    </div>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
};

Item.defaultProps = {
  onDelete: undefined,
};

export default Item;

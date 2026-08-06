/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './ExpirableTime.module.scss';

const DAY = 1000 * 60 * 60 * 24;

const isExpired = (value) => value <= Date.now() - DAY;

const ExpirableTime = React.memo(({ children, date, verboseDate, tooltip, ...props }) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const isoString =
    typeof dateObj.toISOString === 'function' && !Number.isNaN(dateObj.getTime())
      ? dateObj.toISOString()
      : String(date);

  return (
    <time
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      dateTime={isoString}
      title={tooltip ? verboseDate : undefined}
      className={classNames(isExpired(dateObj) && styles.expired)}
    >
      {children}
    </time>
  );
});

ExpirableTime.propTypes = {
  children: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  verboseDate: PropTypes.string,
  tooltip: PropTypes.bool.isRequired,
};

ExpirableTime.defaultProps = {
  verboseDate: undefined,
};

export default ExpirableTime;

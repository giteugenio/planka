/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export default (date, longDateFormat = 'longDateTime', fullDateFormat = 'fullDateTime') => {
  if (!date) {
    return longDateFormat;
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!dateObj || typeof dateObj.getFullYear !== 'function' || Number.isNaN(dateObj.getTime())) {
    return longDateFormat;
  }
  const year = dateObj.getFullYear();
  const currentYear = new Date().getFullYear();

  return year === currentYear ? longDateFormat : fullDateFormat;
};

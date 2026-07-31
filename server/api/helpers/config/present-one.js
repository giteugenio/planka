/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    const fieldsToOmit = [];

    if (sails.config.custom.smtpHost) {
      fieldsToOmit.push(...Config.SMTP_FIELD_NAMES);
    } else if (inputs.record.smtpPassword) {
      fieldsToOmit.push('smtpPassword');
    }

    if (sails.config.custom.wipLimit !== null) {
      fieldsToOmit.push('wipLimit');
    }

    if (fieldsToOmit.length > 0) {
      return _.omit(inputs.record, fieldsToOmit);
    }

    return inputs.record;
  },
};

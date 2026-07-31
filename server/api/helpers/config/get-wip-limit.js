/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const DEFAULT_WIP_LIMIT = 3;

module.exports = {
  DEFAULT_WIP_LIMIT,

  async fn() {
    if (sails.config.custom.wipLimit !== null) {
      return sails.config.custom.wipLimit;
    }

    const config = await Config.qm.getOneMain();

    return config.wipLimit !== null ? config.wipLimit : DEFAULT_WIP_LIMIT;
  },
};

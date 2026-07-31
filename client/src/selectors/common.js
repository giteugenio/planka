/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { selectConfig } from './core';

export const selectIsSocketDisconnected = ({ socket: { isDisconnected } }) => isDisconnected;

export const selectIsInitializing = ({ common: { isInitializing } }) => isInitializing;

export const selectBootstrap = ({ common: { bootstrap } }) => bootstrap;

export const selectOidcBootstrap = (state) => selectBootstrap(state)?.oidc;

export const selectActiveUsersLimit = (state) => selectBootstrap(state)?.activeUsersLimit;

export const selectWipLimit = (state) => {
  const config = selectConfig(state);
  if (config && config.wipLimit !== undefined && config.wipLimit !== null) {
    return config.wipLimit;
  }

  return selectBootstrap(state)?.wipLimit ?? 3;
};

export const selectAccessToken = ({ auth: { accessToken } }) => accessToken;

export const selectAuthenticateForm = ({ ui: { authenticateForm } }) => authenticateForm;

export const selectUserCreateForm = ({ ui: { userCreateForm } }) => userCreateForm;

export const selectProjectCreateForm = ({ ui: { projectCreateForm } }) => projectCreateForm;

export const selectSmtpTestState = ({ ui: { smtpTestState } }) => smtpTestState;

export default {
  selectIsSocketDisconnected,
  selectIsInitializing,
  selectBootstrap,
  selectOidcBootstrap,
  selectActiveUsersLimit,
  selectWipLimit,
  selectAccessToken,
  selectAuthenticateForm,
  selectUserCreateForm,
  selectProjectCreateForm,
  selectSmtpTestState,
};


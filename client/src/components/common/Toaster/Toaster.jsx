/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { Toaster as HotToaster, ToastBar as HotToastBar } from 'react-hot-toast';

import ToastTypes from '../../../constants/ToastTypes';
import FileIsTooBigToast from './FileIsTooBigToast';
import NotEnoughStorageToast from './NotEnoughStorageToast';
import EmptyTrashToast from './EmptyTrashToast';
import SourceCardNotCopyableToast from './SourceCardNotCopyableToast';
import SourceCardNotMovableToast from './SourceCardNotMovableToast';

const TOAST_BY_TYPE = {
  [ToastTypes.FILE_IS_TOO_BIG]: FileIsTooBigToast,
  [ToastTypes.NOT_ENOUGH_STORAGE]: NotEnoughStorageToast,
  [ToastTypes.EMPTY_TRASH]: EmptyTrashToast,
  [ToastTypes.SOURCE_CARD_NOT_COPYABLE]: SourceCardNotCopyableToast,
  [ToastTypes.SOURCE_CARD_NOT_MOVABLE]: SourceCardNotMovableToast,
};

const Toaster = React.memo(() => (
  <HotToaster>
    {(toast) => {
      const Toast =
        toast.message && typeof toast.message === 'object'
          ? TOAST_BY_TYPE[toast.message.type]
          : undefined;

      return (
        <HotToastBar
          toast={toast}
          style={
            Toast
              ? {
                  background: 'transparent',
                  borderRadius: 0,
                  maxWidth: '90%',
                  padding: 0,
                }
              : undefined
          }
        >
          {({ icon, message }) => {
            if (Toast) {
              // eslint-disable-next-line react/jsx-props-no-spreading
              return <Toast {...toast.message.params} id={toast.id} />;
            }

            return (
              <>
                {icon}
                {message}
              </>
            );
          }}
        </HotToastBar>
      );
    }}
  </HotToaster>
));

export default Toaster;

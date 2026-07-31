/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Tab } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm } from '../../../hooks';

import styles from './WipPane.module.scss';

const WipPane = React.memo(() => {
  const config = useSelector(selectors.selectConfig);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      wipLimit: config.wipLimit,
    }),
    [config],
  );

  const [data, handleFieldChange] = useForm(() => ({
    ...defaultData,
    wipLimit: defaultData.wipLimit === null ? '' : `${defaultData.wipLimit}`,
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      wipLimit: parseInt(data.wipLimit, 10) || null,
    }),
    [data],
  );

  const isModified = useMemo(() => !dequal(cleanData, defaultData), [defaultData, cleanData]);

  const handleSubmit = useCallback(() => {
    dispatch(entryActions.updateConfig(cleanData));
  }, [dispatch, cleanData]);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Form onSubmit={handleSubmit}>
        <div className={styles.text}>{t('common.wipLimit')}</div>
        <Input
          fluid
          type="number"
          name="wipLimit"
          value={data.wipLimit}
          min={1}
          step={1}
          placeholder="3"
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.description}>{t('common.wipLimitDescription')}</div>
        <div className={styles.controls}>
          <Button positive disabled={!isModified} content={t('action.save')} />
        </div>
      </Form>
    </Tab.Pane>
  );
});

export default WipPane;

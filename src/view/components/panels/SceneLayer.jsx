import React, { useMemo } from 'react';
import classNames from 'classnames';
import Layer from 'components/panels/Layer';
import { Picture, Cube, LightUp, DocumentLandscape } from 'view/icons';
import { reverse } from 'utils/array';
import styles from './SceneLayer.module.less';

const icons = {
  display: DocumentLandscape,
  effect: LightUp,
  webgl: Cube,
};

export default function SceneLayer({ scene, activeElementId, onLayerClick, onLayerUpdate }) {
  const { id, displayName, enabled } = scene;

  const displays = useMemo(() => reverse(scene.displays), [scene.displays]);
  const effects = useMemo(() => reverse(scene.effects), [scene.effects]);

  const renderLayer = ({ id, type, displayName, enabled }) => (
    <Layer
      key={id}
      id={id}
      name={displayName}
      icon={icons[type]}
      className={styles.child}
      enabled={enabled}
      active={id === activeElementId}
      onLayerClick={onLayerClick}
      onLayerUpdate={onLayerUpdate}
    />
  );

  return (
    <div className={styles.contaainer}>
      <Layer
        key={id}
        id={id}
        name={displayName}
        icon={Picture}
        enabled={enabled}
        active={id === activeElementId}
        onLayerClick={onLayerClick}
        onLayerUpdate={onLayerUpdate}
      />
      <div className={classNames(styles.children)}>
        {effects.map(effect => renderLayer(effect))}
        {displays.map(display => renderLayer(display))}
      </div>
    </div>
  );
}

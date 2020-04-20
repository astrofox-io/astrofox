import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import Layer from 'components/panels/Layer';
import { DISPLAY_TYPE_CANVAS, DISPLAY_TYPE_EFFECT, DISPLAY_TYPE_WEBGL } from 'view/constants';
import { Picture, Cube, LightUp, DocumentLandscape } from 'view/icons';
import styles from './SceneLayer.less';

const icons = {
  [DISPLAY_TYPE_CANVAS]: DocumentLandscape,
  [DISPLAY_TYPE_WEBGL]: Cube,
  [DISPLAY_TYPE_EFFECT]: LightUp,
};

export default function SceneLayer({ scene, activeLayer, onLayerClick, onLayerUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const {
    id,
    properties: { displayName, enabled },
  } = scene;

  const mapLayers = elements =>
    [...elements].map(element => ({ ...element, sceneId: scene.id })).reverse();

  const displays = useMemo(() => mapLayers(scene.displays), [scene.displays]);
  const effects = useMemo(() => mapLayers(scene.effects), [scene.effects]);

  const renderLayer = ({ id, type, properties: { displayName, enabled } }) => (
    <Layer
      key={id}
      id={id}
      name={displayName}
      icon={icons[type]}
      className={styles.child}
      enabled={enabled}
      active={activeLayer === id}
      onLayerClick={onLayerClick}
      onLayerUpdate={onLayerUpdate}
    />
  );

  function handleExpand() {
    setExpanded(expanded => !expanded);
  }

  return (
    <div className={styles.contaainer} onDoubleClick={handleExpand}>
      <Layer
        key={id}
        id={id}
        name={displayName}
        icon={Picture}
        enabled={enabled}
        active={activeLayer === id}
        onLayerClick={onLayerClick}
        onLayerUpdate={onLayerUpdate}
      />
      <div className={classNames(styles.children, { [styles.hidden]: !expanded })}>
        {effects.map(effect => renderLayer(effect))}
        {displays.map(display => renderLayer(display))}
      </div>
    </div>
  );
}

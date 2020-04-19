import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import Layer from 'components/panels/Layer';
import iconScene from 'assets/icons/picture.svg';
import iconDisplay from 'assets/icons/cube.svg';
import iconEffect from 'assets/icons/light-up.svg';
import iconCanvasDisplay from 'assets/icons/document-landscape.svg';
import styles from './SceneLayer.less';

const icons = {
  '2d': iconCanvasDisplay,
  webgl: iconDisplay,
  fx: iconEffect,
};

export default function SceneLayer({ scene, activeLayer, onLayerClick, onLayerUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const {
    id,
    properties: { displayName, enabled },
  } = scene;

  const mapLayers = elements =>
    [].concat(elements.map(element => ({ ...element, sceneId: scene.id }))).reverse();

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
        icon={iconScene}
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

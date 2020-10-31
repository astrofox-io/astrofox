export function property(name, compare) {
  return display => {
    const value = display.properties[name];
    return compare ? compare(value) : value;
  };
}

export function stageWidth(transform) {
  return display => {
    const value = display.scene.getSize().width;
    return transform ? transform(value) : value;
  };
}

export function stageHeight(transform) {
  return display => {
    const value = display.scene.getSize().height;
    return transform ? transform(value) : value;
  };
}

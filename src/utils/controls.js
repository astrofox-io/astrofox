export function property(name, compare) {
  return display => {
    const value = display.properties[name];
    return compare ? compare(value) : value;
  };
}

export function stageWidth(display) {
  return display.scene.getSize().width;
}

export function stageHeight(display) {
  return display.scene.getSize().height;
}

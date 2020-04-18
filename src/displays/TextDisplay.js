import CanvasDisplay from 'core/CanvasDisplay';
import CanvasText from 'canvas/CanvasText';

export default class TextDisplay extends CanvasDisplay {
  static label = 'Text';

  static className = 'TextDisplay';

  static defaultProperties = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    x: 0,
    y: 0,
    color: '#FFFFFF',
    rotation: 0,
    opacity: 1.0,
  };

  constructor(properties) {
    super(TextDisplay, properties);

    this.text = new CanvasText(this.properties, this.canvas);
    this.text.render();
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      if (this.text.update(properties)) {
        let render = false;

        Object.keys(CanvasText.defaultproperties).forEach(prop => {
          if (properties[prop] !== undefined) {
            render = true;
          }
        });

        if (render) {
          this.text.render();
        }
      }
    }

    return changed;
  }
}

import Component from '@ember/component';
import layout from '../templates/components/select-box';
import { get, setProperties } from '@ember/object';

const attributeBindings = ['width', 'height', 'fill', 'stroke-width', 'x', 'y', 'stroke', 'transform'];
const PAD = 5;

export default Component.extend({
  layout,
  tagName: 'rect',
  attributeBindings,
  'stroke-width': 1,
  stroke: '#000',
  fill: 'transparent',
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  transform: '',

  init() {
    this._super(...arguments);
    this.appendTo(get(this, 'target'));
  },

  localClassNames: 'select-box',

  click() {
    this.focusTextArea();
    return false;
  },

  select(textComponent) {
    let { element, transform } = textComponent;
    let { height, width, x, y } = element.getBBox();
    setProperties(this, {
      height: height + (PAD / 2),
      width: width + PAD,
      x: x - (PAD / 2),
      y: y - (PAD / 4),
      transform
    });
  },
  unselect() {
    setProperties(this, {
      height: 0,
      width: 0
    });
  }
});

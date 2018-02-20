import Component from '@ember/component';
import layout from '../templates/components/select-box';

const attributeBindings = ['width', 'height', 'fill', 'stroke-width', 'x', 'y', 'stroke', 'transform'];

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

  localClassNames: 'select-box',
});

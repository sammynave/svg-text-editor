import Component from '@ember/component';
import layout from '../templates/components/text-el';

export default Component.extend({
  layout,
  tagName: 'text',
  click() {
    console.log('hi');
  }
});

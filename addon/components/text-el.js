import Component from '@ember/component';
import layout from '../templates/components/text-el';
import { get } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'text',
  click() {
    this.select(get(this, 'elementId'));
  }
});

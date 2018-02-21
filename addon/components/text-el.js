import Component from '@ember/component';
import layout from '../templates/components/text-el';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: 'text',
  text: alias('wrapper.asMarkup'),

  click() {
    this.select(get(this, 'elementId'));
  }
});

import Component from '@ember/component';
import layout from '../templates/components/text-el';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import Wrapper from '../lib/wrapper';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
  layout,
  tagName: 'text',
  text: alias('wrapper.asMarkup'),

  didInsertElement() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => {
      let wrapper = Wrapper.create({
        parentEl: get(this, 'element'),
        text: get(this, 'initialText'),
        maxWidth: get(this, 'maxWidth')
      });

      set(this, 'wrapper', wrapper);
    });
  },

  click() {
    this.select(get(this, 'elementId'));
    return false;
  }
});

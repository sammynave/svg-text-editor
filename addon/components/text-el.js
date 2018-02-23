import Component from '@ember/component';
import layout from '../templates/components/text-el';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import Wrapper from '../utils/wrapper';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
  layout,
  tagName: 'text',
  text: alias('wrapper.markup'),

  didInsertElement() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => {
      let wrapper = Wrapper.create({
        parentEl: get(this, 'element'),
        initialText: get(this, 'initialText'),
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

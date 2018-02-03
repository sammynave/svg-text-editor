import Component from '@ember/component';
import layout from '../templates/components/text-tracker';
import { computed, get } from '@ember/object';
import { isPresent } from '@ember/utils';

export default Component.extend({
  layout,
  tagName: '',
  formatStyles: computed('styles', function() {
    let styles = get(this, 'styles');
    if (isPresent(styles)) {
      let formatted = Object.entries(styles)
        .map((styleTuple) => {
          return styleTuple.join(':');
        }).join(';').concat(';');
      return formatted;
    }
  })
});

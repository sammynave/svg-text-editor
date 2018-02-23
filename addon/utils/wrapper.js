import EmberObject, { computed, get, set } from '@ember/object';
import { formatText, tspanify } from './wrapper/utils';

const Wrapper = EmberObject.extend({
  initialText: null,
  lines: null,

  init() {
    this._super(...arguments);
    this.setText(get(this, 'initialText'));
  },

  text: computed('lines', function() {
    return get(this, 'lines').join('\n');
  }),

  markup: computed('lines', function() {
    return get(this, 'lines').map((line) => {
      return tspanify(line);
    }).join('');
  }),

  setText(text) {
    let lines = text.split('\n');
    let formattedLines = formatText(lines, get(this, 'maxWidth'), get(this, 'parentEl'));
    set(this, 'lines', formattedLines);
  }
});

export default Wrapper;

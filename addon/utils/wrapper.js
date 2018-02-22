import EmberObject, { computed, get, set } from '@ember/object';
import { formatText, tspanify } from './wrapper/utils';

const Wrapper = EmberObject.extend({
  text: null,

  setText(text) {
    let formattedLines = formatText(text, get(this, 'maxWidth'), get(this, 'parentEl'));
    console.log(formattedLines);
    set(this, 'text', formattedLines.join('\n'));
  },

  asLines: computed('text', function() {
    return get(this, 'text').split('\n');
  }),

  asMarkup: computed('asLines', function() {
    return get(this, 'asLines').map((line) => {
      return tspanify(line);
    }).join('');
  }),
});

export default Wrapper;

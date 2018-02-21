import EmberObject, { computed, get } from '@ember/object';

const Wrapper = EmberObject.extend({
  text: null,
  asLines: computed('text', function() {
    return get(this, 'text').split('\n');
  }),
  asMarkup: computed('asLines', function() {
    return get(this, 'asLines').map((line) => `<tspan x="0" dy="1.2em">${line}</tspan>`).join('');
  })
});

export default Wrapper;

import { task } from 'ember-concurrency';
import fetch from 'fetch';
import EmberObject, { get } from '@ember/object';

const SvgLoader = EmberObject.extend({
  fetch: task(function* (src) {
    let response = yield fetch(src);
    return yield response.text();
  }),

  insert: task(function* (src) {
    let svgText = yield get(this, 'fetch').perform(src);
    let svgContainer = document.createElement('div');
    svgContainer.innerHTML = svgText;
    document.body.appendChild(svgContainer);
    return svgContainer;
  })
});

export default SvgLoader;

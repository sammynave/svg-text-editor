import Component from '@ember/component';
import layout from '../templates/components/svg-editor';
import { task, timeout } from 'ember-concurrency';
import fetch from 'fetch';
import { get, set } from '@ember/object';
import { isPresent } from '@ember/utils';

export default Component.extend({
  layout,

  loadSvg: task(function* () {
    let svgText = yield get(this, 'fetchSvg').perform(get(this, 'src'));
    let svg = this.textToFragment(svgText);
    let targetIds = get(this, 'targetIds');
    let targetElements = targetIds.map((id) => svg.querySelector(`#${id}`));
    targetElements.forEach((te) => this.bindEditEvents);

    set(this, 'targetElements', targetElements);
    set(this, 'svg', svg)
  }).on('init'),

  fetchSvg: task(function* (src) {
    let response = yield fetch(src);
    return yield response.text();
  }),

  textToFragment(text) {
    return document.createRange().createContextualFragment(text);
  },

  click(e) {
    let { target, clientX, clientY } = e;
    if (get(this, 'targetElements').includes(target)) {
      let { attributes } = target;
      let container = this.element;
      let initialBBox = target.getBBox();
      let { width, height } = initialBBox;
      let x = container.offsetLeft + target.clientLeft; // will need to handle translate `+ translateX`
      let y = container.offsetTop + target.clientTop - height / 2; // will need to handle translate `+ translateY`

      let imposterStyles = {
        position: 'absolute',
        background: 'none',
        left: x + 'px',
        top: y + 'px',
        width: width + '%',
        height: height + '%',
        color: attributes.fill.textContent,
        'font-family': attributes['font-family'].value,
        'font-size': attributes['font-size'].value
      };

      set(this, 'content', target.textContent);
      set(this, 'imposterStyles', imposterStyles);
    }
  },
  actions: {
    update(a, b, c) {
      debugger;
    }
  }
});

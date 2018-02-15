import Component from '@ember/component';
import fetch from 'fetch';
import { task } from 'ember-concurrency';
import { get, setProperties } from '@ember/object';
import { getOwner } from '@ember/application';

function remove(array, element) {
  return array.filter(e => e !== element);
}

export default Component.extend({
  tagName: '',
  loadSvg: task(function* () {
    let svgText = yield get(this, 'fetchSvg').perform(get(this, 'src'));
    let div = document.createElement('div');
    div.innerHTML = svgText;
    document.body.appendChild(div);
    this.appendToSvgEl()
  }).on('init'),

  fetchSvg: task(function* (src) {
    let response = yield fetch(src);
    return yield response.text();
  }),

  appendToSvgEl() {
    let TextElFactory = getOwner(this).factoryFor('component:text-el');
    get(this, 'targetIds').forEach((targetId) => {
      let oldEl = document.getElementById(targetId);
      let attrNames = remove(oldEl.getAttributeNames(), 'id');

      let opts = {
        text: oldEl.textContent,
        attributeBindings: attrNames,
        elementId: targetId
      };

      attrNames.forEach((k) => {
        opts[k] = oldEl.getAttribute(k);
      });

      let textElComponent = TextElFactory.create();
      setProperties(textElComponent, opts);
      let parentId = oldEl.parentElement.id;
      oldEl.remove();
      textElComponent.appendTo(`#${parentId}`);
    });
  }
});

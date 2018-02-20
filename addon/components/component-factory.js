import Component from '@ember/component';
import fetch from 'fetch';
import { task } from 'ember-concurrency';
import { set, get, setProperties } from '@ember/object';
import { getOwner } from '@ember/application';

function remove(array, element) {
  return array.filter(e => e !== element);
}

const PAD = 5;

export default Component.extend({
  tagName: '',
  loadSvg: task(function* () {
    let svgText = yield get(this, 'fetchSvg').perform(get(this, 'src'));
    let svgContainer = document.createElement('div');
    svgContainer.innerHTML = svgText;
    document.body.appendChild(svgContainer);
    this.appendToSvgEl(svgContainer.querySelector('svg'))
  }).on('init'),

  fetchSvg: task(function* (src) {
    let response = yield fetch(src);
    return yield response.text();
  }),

  appendToSvgEl(svg) {
    let SelectBoxFactory = getOwner(this).factoryFor('component:select-box');
    let selectBoxComponent = SelectBoxFactory.create();
    selectBoxComponent.appendTo(svg);
    set(this, 'selectBoxComponent', selectBoxComponent);

    let TextElFactory = getOwner(this).factoryFor('component:text-el');
    get(this, 'targetIds').forEach((targetId) => {
      let oldEl = document.getElementById(targetId);
      let attrNames = remove(oldEl.getAttributeNames(), 'id');

      let opts = {
        text: oldEl.textContent,
        attributeBindings: attrNames,
        elementId: targetId,
        select: this.select.bind(this)
      };

      attrNames.forEach((k) => {
        opts[k] = oldEl.getAttribute(k);
      });

      let textElComponent = TextElFactory.create();
      setProperties(textElComponent, opts);
      let parentId = oldEl.parentElement.id;
      oldEl.remove();
      textElComponent.appendTo(`#${parentId}`);
      set(this, targetId, textElComponent);
    });
  },

  showSelectBox: false,

  select(id) {
    set(this, 'currentSelection', id);
    let sbx = get(this, 'selectBoxComponent');
    let textComponent = get(this, id);
    let { element, transform } = textComponent;
    let { height, width, x, y } = element.getBBox();
    setProperties(sbx, {
      height: height + (PAD / 2),
      width: width + PAD,
      x: x - (PAD / 2),
      y: y - (PAD / 4),
      transform
    });
  }
});

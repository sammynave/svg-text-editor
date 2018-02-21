import Component from '@ember/component';
import fetch from 'fetch';
import { task } from 'ember-concurrency';
import { set, get, setProperties, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import layout from '../templates/components/component-factory';
import { later } from '@ember/runloop';

function remove(array, element) {
  return array.filter(e => e !== element);
}

const PAD = 5;

export default Component.extend({
  tagName: '',
  layout,
  loadSvg: task(function* () {
    let svgText = yield get(this, 'fetchSvg').perform(get(this, 'src'));
    let svgContainer = document.getElementById(get(this, 'container'));
    svgContainer.innerHTML = svgText;
    svgContainer.addEventListener('click', this.actions.unselect.bind(this));
    document.body.appendChild(svgContainer);
    this.appendToSvgEl(svgContainer.querySelector('svg'))
  }).on('init'),

  fetchSvg: task(function* (src) {
    let response = yield fetch(src);
    return yield response.text();
  }),

  createSelectBox(svg) {
    let SelectBoxFactory = getOwner(this).factoryFor('component:select-box');
    let selectBoxComponent = SelectBoxFactory.create();
    selectBoxComponent.appendTo(svg);
    set(this, 'selectBoxComponent', selectBoxComponent);
  },

  createTextEls() {
    let TextElFactory = getOwner(this).factoryFor('component:text-el');
    get(this, 'targetIds').forEach((targetId) => {
      let oldEl = document.getElementById(targetId);
      let attrNames = remove(oldEl.getAttributeNames(), 'id');
      let opts = {
        text: oldEl.textContent,
        attributeBindings: attrNames,
        elementId: targetId,
        select: this.actions.select.bind(this)
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

  appendToSvgEl(svg) {
    this.createSelectBox(svg);
    this.createTextEls();
  },

  actions: {
    unselect() {
      set(this, 'currentSelection', null);
      let sbx = get(this, 'selectBoxComponent');
      setProperties(sbx, {
        height: 0,
        width: 0
      });
    },
    updateText(e) {
      let { target, inputType } = e;
      let { value } = target;
      if (e.inputType === 'insertLineBreak') {
        console.log('tspan');
      } else if (e.inputType === 'deleteContentBackward') {
        console.log('delete');
      }
      set(this, `${get(this, 'currentSelection')}.text`, value);
      let textComponent = get(this, get(this, 'currentSelection'));
      later(() => this.updateSelectBoxProps(textComponent), 0);
    },
    select(id) {
      set(this, 'currentSelection', id);
      this.updateSelectBoxProps(get(this, id));
    }
  },

  updateSelectBoxProps(textComponent) {
    let sbx = get(this, 'selectBoxComponent');
    let { element, transform } = textComponent;
    let { height, width, x, y } = element.getBBox();
    setProperties(sbx, {
      height: height + (PAD / 2),
      width: width + PAD,
      x: x - (PAD / 2),
      y: y - (PAD / 4),
      transform
    });
  },

  selectedText: computed('currentSelection', function() {
    return get(this, `${get(this, 'currentSelection')}.text`);
  })
});

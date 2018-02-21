import Component from '@ember/component';
import fetch from 'fetch';
import { task } from 'ember-concurrency';
import { set, get, setProperties, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import layout from '../templates/components/component-factory';
import { scheduleOnce } from '@ember/runloop';
import Wrapper from '../lib/wrapper';

function remove(array, element) {
  return array.filter(e => e !== element);
}

export default Component.extend({
  tagName: '',
  layout,
  selectBoxComponent: null,
  currentSelection: null,

  loadSvg: task(function* () {
    let svgText = yield get(this, 'fetchSvg').perform(get(this, 'src'));
    let svgContainer = document.getElementById(get(this, 'container'));
    svgContainer.innerHTML = svgText;
    document.addEventListener('click', this.actions.unselect.bind(this));
    document.body.appendChild(svgContainer);
    this.appendToSvgEl(svgContainer.querySelector('svg'))
  }).on('init'),

  fetchSvg: task(function* (src) {
    let response = yield fetch(src);
    return yield response.text();
  }),

  createSelectBox(svg) {
    let SelectBoxFactory = getOwner(this).factoryFor('component:select-box');
    set(this, 'selectBoxComponent', SelectBoxFactory.create({ target: svg, focusTextArea: this.actions.focusTextArea.bind(this) }));
  },

  createTextEls() {
    let TextElFactory = getOwner(this).factoryFor('component:text-el');
    get(this, 'targetIds').forEach((targetId) => {
      let oldEl = document.getElementById(targetId);
      let attrNames = remove(oldEl.getAttributeNames(), 'id');
      let wrapper = Wrapper.create({ text: oldEl.textContent })
      let opts = {
        wrapper,
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
      get(this, 'selectBoxComponent').unselect();
    },

    updateText(e) {
      let { target: { value } } = e;
      let textComponent = get(this, get(this, 'currentSelection'));
      let wrapper = get(textComponent, 'wrapper');
      set(wrapper, 'text', value);
      scheduleOnce('afterRender', this, () => this.updateSelectBoxProps(textComponent));
    },

    select(id) {
      set(this, 'currentSelection', id);
      this.updateSelectBoxProps(get(this, id));
      scheduleOnce('afterRender', this, this.actions.focusTextArea);
    },

    focusTextArea() {
      document.getElementById('textarea').focus();
    }
  },

  updateSelectBoxProps(textComponent) {
    get(this, 'selectBoxComponent').select(textComponent);
  },

  selectedText: computed('currentSelection', function() {
    return get(this, `${get(this, 'currentSelection')}.wrapper.text`);
  })
});

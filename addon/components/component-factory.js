import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { set, get, setProperties, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import layout from '../templates/components/component-factory';
import { scheduleOnce } from '@ember/runloop';
import Wrapper from '../lib/wrapper';
import SvgLoader from '../lib/svg-loader'

function remove(array, element) {
  return array.filter(e => e !== element);
}

export default Component.extend({
  tagName: '',
  layout,
  selectBoxComponent: null,
  currentSelection: null,

  createSvg: task(function* () {
    let svgLoader =  SvgLoader.create();
    let svgContainerEl = yield get(svgLoader, 'insert').perform(get(this, 'src'));
    svgContainerEl.addEventListener('click', this.actions.unselect.bind(this));
    this.createSelectBox(svgContainerEl.querySelector('svg'));
    this.createTextEls(svgContainerEl.querySelector('svg'));
    set(this, 'svgContainerEl', svgContainerEl);
  }).on('init'),

  createSelectBox(svg) {
    let SelectBoxFactory = getOwner(this).factoryFor('component:select-box');
    set(this, 'selectBoxComponent', SelectBoxFactory.create({ target: svg, focusTextArea: this.actions.focusTextArea.bind(this) }));
  },

  createTextEls(svg) {
    let TextElFactory = getOwner(this).factoryFor('component:text-el');
    get(this, 'targetIds').forEach((targetId) => {
      let oldEl = svg.getElementById(targetId);
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
  selectedText: computed('currentSelection', function() {
    return get(this, `${get(this, 'currentSelection')}.wrapper.text`);
  }),

  actions: {
    unselect(e) {
      if (e.target === get(this, 'selectBoxComponent.element')) {
        return;
      }

      set(this, 'currentSelection', null);
      get(this, 'selectBoxComponent').unselect();
    },

    updateText(e) {
      let { target: { value } } = e;
      let textComponent = get(this, get(this, 'currentSelection'));
      let wrapper = get(textComponent, 'wrapper');
      set(wrapper, 'text', value);
      scheduleOnce('afterRender', this, () => get(this, 'selectBoxComponent').select(textComponent));
    },

    select(id) {
      set(this, 'currentSelection', id);
      get(this, 'selectBoxComponent').select(get(this, id));
      scheduleOnce('afterRender', this, this.actions.focusTextArea);
    },

    focusTextArea(e) {
      document.getElementById('textarea').focus();
    }
  }
});

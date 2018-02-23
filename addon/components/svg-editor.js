import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { set, get, setProperties, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import layout from '../templates/components/svg-editor';
import { scheduleOnce } from '@ember/runloop';
import SvgLoader from '../lib/svg-loader';
import TextElFactory from '../lib/text-el-factory';
import SelectBoxFactory from '../lib/select-box-factory';

function createSelectedTextComputed(keys) {
  let cacheKeys = keys.map((key) => `${key}.wrapper.text`);
  return computed('currentSelection', ...cacheKeys, function() {
    console.log('computed');
    return get(this, `${get(this, 'currentSelection')}.wrapper.text`);
  });
}

export default Component.extend({
  tagName: '',
  layout,

  createSvg: task(function* () {
    let svgLoader =  SvgLoader.create();
    let svgContainerEl = yield get(svgLoader, 'insert').perform(get(this, 'src'));
    svgContainerEl.addEventListener('click', this.actions.unselect.bind(this));

    let selectBoxFactory = SelectBoxFactory.create({
      owner: getOwner(this),
      svgContainerEl,
      focusTextArea: this.actions.focusTextArea.bind(this)
    });
    set(this, 'selectBoxComponent', selectBoxFactory.make());

    let textElFactory = TextElFactory.create({
      owner: getOwner(this),
      svgContainerEl,
      targetIds: get(this, 'targetIds'),
      select: this.actions.select.bind(this),
      maxWidth: 100
    });

    let textElComponents = textElFactory.make();
    setProperties(this, textElComponents);

    set(this, 'selectedText', createSelectedTextComputed(Object.keys(textElComponents)));

    set(this, 'svgContainerEl', svgContainerEl);
  }).on('init'),

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
      get(textComponent, 'wrapper').setText(value);
      scheduleOnce('afterRender', this, () => get(this, 'selectBoxComponent').select(textComponent));
    },

    select(id) {
      set(this, 'currentSelection', id);
      get(this, 'selectBoxComponent').select(get(this, id));
      scheduleOnce('afterRender', this, this.actions.focusTextArea);
    },

    focusTextArea() {
      document.getElementById(get(this, 'elementIdToFocus')).focus();
    }
  }
});

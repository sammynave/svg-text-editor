import EmberObject, { get } from '@ember/object';

const SelectBoxFactory = EmberObject.extend({
  make() {
    let svg = get(this, 'svgContainerEl').querySelector('svg');
    let SelectBoxFactory = get(this, 'owner').factoryFor('component:select-box');
    let focusTextArea = get(this, 'focusTextArea');

    return SelectBoxFactory.create({ target: svg, focusTextArea });
  }
});

export default SelectBoxFactory;

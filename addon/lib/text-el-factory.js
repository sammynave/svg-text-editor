import EmberObject, {
  get,
  setProperties,
  set,
  getProperties
} from '@ember/object';
import Wrapper from './wrapper';

function remove(array, element) {
  return array.filter(e => e !== element);
}

const TextElFactory = EmberObject.extend({
  make() {
    let svgContainerEl = get(this, 'svgContainerEl');

    /*
     * temporarily insert into dom so we can
     * use ember's `appendTo` method
    */
    document.body.appendChild(svgContainerEl);

    let svg = svgContainerEl.querySelector('svg');

    let TextElFactory = get(this, 'owner').factoryFor('component:text-el');
    get(this, 'targetIds').forEach((targetId) => {
      let oldEl = svg.getElementById(targetId);
      let attrNames = remove(oldEl.getAttributeNames(), 'id');
      let wrapper = Wrapper.create({ text: oldEl.textContent });
      let opts = {
        wrapper,
        attributeBindings: attrNames,
        elementId: targetId,
        select: get(this, 'select')
      };

      /*
       * copy attributes of original <text> element
       * into new component
       * we may need to special case the `style` attribute
       * as it currently throws a warning in console
       * see https://emberjs.com/deprecations/v1.x/#toc_binding-style-attributes
      */
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

    /*
     * ensure svg isn't rendered unless
     * we request it in the template
    */
    svgContainerEl.remove();

    return getProperties(this, get(this, 'targetIds'));
  }
});

export default TextElFactory;

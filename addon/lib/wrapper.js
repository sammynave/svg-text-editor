import EmberObject, { computed, get, set } from '@ember/object';
function tspanify(line) {
 return `<tspan x="0" dy="1.2em">${line}</tspan>`;
}

function remove(array, element) {
  return array.filter(e => e !== element);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const CHAR = 'c';

const Wrapper = EmberObject.extend({
  text: null,

  setText(text) {
    let lines = text.split('\n');
    let formattedLines = lines.reduce((acc, line) => {
      let fits = (this.measure(line) <= get(this, 'maxWidth'));
      if (fits) {
        acc.push(line);
      } else {
        let brokenLines = this.breakUp(line);
        acc = acc.concat(brokenLines);
      }
      return acc;
    }, []);
    set(this, 'text', formattedLines.join('\n'));
  },
  asLines: computed('text', function() {
    return get(this, 'text').split('\n');
  }),

  asMarkup: computed('asLines', function() {
    return get(this, 'asLines').map((line) => {
      return tspanify(line);
    }).join('');
  }),

  measure(item) {
    /*
     * To measure text in SVG, first we append the `containerElement` to the
     * `parentElement`. Then, we set the text content on `textElement` and measure
     * the bounding box. Finally, we remove the `containerElement` from the parent.
     *
     * The root element of the context may be any `SVGElement` including `<text>`
     * elements, so find the best `<text>` element for measuring. We prioritize
     * exact `<text>` elements, then the first existing `<text>` element descendent,
     * then finally we will just create a new `<text>` element.
     */
    let parentEl = get(this, 'parentEl');
    let containerEl = parentEl.parentElement;

    let attrNames = remove(remove(parentEl.getAttributeNames(), 'id'), 'class');

    let tempText = document.createElementNS(SVG_NS, 'text');
    attrNames.forEach((k) => {
      tempText.setAttribute(k, parentEl.getAttribute(k));
    });
    tempText.id = 'temp-text';

    let tspan = document.createElementNS(SVG_NS, 'tspan')
    tempText.appendChild(tspan);
    tspan.setAttribute('x', 0);
    tspan.setAttribute('dy', '1.2em');
    tspan.textContent = item;
    containerEl.appendChild(tempText);
    let { width } = tempText.getBBox();

    containerEl.removeChild(tempText); // element.remove() doesn't work in IE11
    return width;
  },

  breakUp(line) {
    let charWidth = this.measure(CHAR);
    line = line.replace(/^ +| +$/gm, '');
    let targetSplitIndexFromEnd = Math.round((line.length * charWidth) - get(this, 'maxWidth'));
    let targetSplitIndex = line.length - targetSplitIndexFromEnd;

    while(targetSplitIndex > 0) {
      if (line[targetSplitIndex] === ' ') {
        break;
      } else {
        targetSplitIndex--;
      }
    }

    return [line.slice(0, targetSplitIndex), line.slice(targetSplitIndex)];
  }
});

export default Wrapper;

import { formatText, measure, breakUp } from 'dummy/utils/wrapper/utils';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Unit | Utility | wrapper', function(hooks) {
  setupRenderingTest(hooks);
  hooks.beforeEach(async function() {
    await render(hbs`
      <svg>
        <g>
          <text id="text" font-size=10></text>
        </g>
      </svg>
    `);

    this.parentEl = document.getElementById('text');
  });

  test("works on empty string", function(assert) {
    let result = measure("", this.parentEl);
    assert.deepEqual(result, { width: 0, height: 0 }, "empty string has 0 width and height");
  });

  test("works on whitespaces", function(assert) {
    let result = measure(" \t  ", this.parentEl);
    assert.equal(result.width, 0, "whitespace has width 0");
    assert.equal(result.height, 0, "whitespace has height 0");
  });

  test("works on whitespaces in middle", function(assert) {
    let baseResult = measure("a a", this.parentEl);
    let result = measure("a   a", this.parentEl);
    assert.equal(result.width, baseResult.width, "multiple whitespaces occupy same space");
    assert.equal(result.height, baseResult.height, "height is the same");
  });

  test("works on multiple lines", function(assert) {
    let baseResult = measure("a", this.parentEl);
    let result = measure("a\na", this.parentEl);
    assert.equal(result.width, baseResult.width, "width has not changed");
    assert.equal(result.height, baseResult.height * 2, "height has changed");
  });

  // test('it measures text', async function(assert) {


  //   let result1 = measure('c', parentEl);
  //   assert.equal(result1, 4.4375, 'text is measured correctly');

  //   let result2 = measure('cc', parentEl);
  //   assert.equal(result2, 8.875, 'text is measured correctly');

  //   let result3 = measure(' ', parentEl);
  //   assert.equal(result3, 4.4375, 'text is measured correctly');
  // });

  // test('it formats text', async function(assert) {

  //   await render(hbs`
  //     <svg>
  //       <g>
  //         <text id="text" font-size=10></text>
  //       </g>
  //     </svg>
  //   `);

  //   let text = ' hi there \n hey';
  //   let maxWidth = 10;
  //   let parentEl = document.getElementById('text');
  //   let result = formatText(text, maxWidth, parentEl);

  //   assert.equal(result, '', 'text is formatted correctly');
  // });

  // test('it breaks up text', async function(assert) {
  //   await render(hbs`
  //     <svg>
  //       <g>
  //         <text id="text" font-size=10></text>
  //       </g>
  //     </svg>
  //   `);

  //   let text = ' hi there \n hey this line should be broken up';
  //   let maxWidth = 10;
  //   let parentEl = document.getElementById('text');
  //   let result = breakUp(text, maxWidth, parentEl);

  //   assert.equal(result, '', 'text is formatted correctly');
  // });
});

/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

export default function initDeprecated() {
  // This fills in any plugins that no longer
  // exist but may still exist in user data.
  const deprecated = ['twitter'];

  for (let i = 0; i < deprecated.length; i += 1) {
    window.Popcorn.plugin(deprecated[i], {
      manifest: {
        deprecated: true,
      },
    });
  }
}

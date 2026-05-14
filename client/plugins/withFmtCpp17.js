'use strict';

const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const MARKER = '# __fmt_cpp17_apple_clang_fix__ (facebook/react-native#55601)';

const SNIPPET = `
    ${MARKER}
    # Newer Apple Clang rejects fmt's consteval format checks; compile fmt as C++17 only.
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |bc|
          bc.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end
`;

function insertAfterReactNativePostInstall(podfile) {
  const anchor = 'react_native_post_install(';
  const start = podfile.indexOf(anchor);
  if (start === -1) {
    return { ok: false, reason: 'react_native_post_install not found' };
  }

  const openParen = podfile.indexOf('(', start);
  if (openParen === -1) {
    return { ok: false, reason: 'react_native_post_install call has no (' };
  }

  let depth = 0;
  for (let i = openParen; i < podfile.length; i++) {
    const c = podfile[i];
    if (c === '(') depth += 1;
    else if (c === ')') {
      depth -= 1;
      if (depth === 0) {
        let j = i + 1;
        while (j < podfile.length && podfile[j] !== '\n') j += 1;
        const insertPos = j;
        return {
          ok: true,
          next: podfile.slice(0, insertPos) + SNIPPET + podfile.slice(insertPos),
        };
      }
    }
  }

  return { ok: false, reason: 'unbalanced parentheses in react_native_post_install' };
}

/** @param {import('expo/config').ExpoConfig} config */
module.exports = function withFmtCpp17Fix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const podfilePath = path.join(root, 'Podfile');
      if (!fs.existsSync(podfilePath)) {
        return cfg;
      }

      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (contents.includes(MARKER)) {
        return cfg;
      }

      const result = insertAfterReactNativePostInstall(contents);
      if (!result.ok) {
        console.warn(`withFmtCpp17Fix: could not patch Podfile (${result.reason})`);
        return cfg;
      }

      fs.writeFileSync(podfilePath, result.next);
      return cfg;
    },
  ]);
};

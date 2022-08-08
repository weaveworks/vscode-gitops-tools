/**
 * Currently edge releases have the following format: `3.0.0-edge.1` which
 * is valid semver but invalid as version to be published on the marketplace
 * (see also https://github.com/microsoft/vscode-vsce/issues/148 for context).
 * This means that edge releases are currently not possible with the workflow
 * we have.
 */
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath).toString());

const newVersion = pkg.version.split('.').slice(0, 2)

/**
 * VSCode Marketplace version requirements:
 * It must be one to four numbers in the range 0 to 2147483647,
 * with each number seperated by a period. It must contain at least one non-zero number.
 */
const prereleaseDate = Math.floor(Date.now() / 1000);
newVersion.push(prereleaseDate);
pkg.version = `${newVersion.join('.')}`;

console.log(`Update package.json with Edge version:\n\n${JSON.stringify(pkg, null, 2)}`);
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

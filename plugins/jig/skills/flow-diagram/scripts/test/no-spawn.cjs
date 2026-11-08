// Preload for the regression test of --open: every spawn throws EPERM, like the eval sandbox did.
const cp = require('node:child_process');
cp.spawn = () => { const e = new Error('spawn EPERM'); e.code = 'EPERM'; throw e; };

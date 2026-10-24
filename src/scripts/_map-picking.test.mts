import assert from 'node:assert/strict';
import { nearbyPlaces } from './map-picking.ts';

const points = [
  { href: '/place/iraq/', x: 100, y: 100 },
  { href: '/place/kufa/', x: 110, y: 105 },
  { href: '/place/karbala/', x: 108, y: 101 },
  { href: '/place/far/', x: 300, y: 300 },
];
for (const point of points) {
  assert.ok(nearbyPlaces(points, point.x, point.y).includes(point), 'every visible center includes its own place despite paint-order overlap');
}
assert.deepEqual(nearbyPlaces(points, 100, 100).map(p => p.href), ['/place/iraq/', '/place/karbala/', '/place/kufa/']);
const coincident = [{ href: '/b', x: 0, y: 0 }, { href: '/a', x: 0, y: 0 }, { href: '/b', x: 0, y: 0 }];
assert.deepEqual(nearbyPlaces(coincident, 0, 0).map(p => p.href), ['/a', '/b'], 'coincident places are retained, duplicates excluded');
assert.deepEqual(nearbyPlaces([...coincident].reverse(), 0, 0).map(p => p.href), ['/a', '/b'], 'ties do not depend on SVG stacking');
assert.deepEqual(nearbyPlaces([{ href: '/b', x: -10, y: 0 }, { href: '/a', x: 10, y: 0 }], 0, 0).map(p => p.href), ['/a', '/b']);
assert.equal(nearbyPlaces([{ href: '/edge', x: 10, y: 24 }], 0, 0).length, 1, '26px boundary is inclusive');
assert.equal(nearbyPlaces([{ href: '/outside', x: 26.01, y: 0 }], 0, 0).length, 0);
for (const scale of [0.3, 1, 2]) {
  const scaled = [{ href: '/first', x: 100 * scale, y: 50 * scale }, { href: '/second', x: 140 * scale, y: 50 * scale }];
  assert.equal(nearbyPlaces(scaled, 100 * scale, 50 * scale).length, scale === 0.3 ? 2 : 1, 'radius stays in CSS pixels as projected map scale changes');
}
assert.deepEqual(nearbyPlaces(points, 300, 300), [points[3]], 'isolated place');
assert.deepEqual(nearbyPlaces(points, -100, -100), []);
assert.deepEqual(nearbyPlaces([], 0, 0), []);
assert.deepEqual(nearbyPlaces(points, NaN, 0), []);
console.log('map-picking: all tests passed');

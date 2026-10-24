import { nearbyPlaces } from './map-picking';
import { arCount } from './shared';

document.querySelectorAll<HTMLElement>('.atlas-map').forEach((map) => {
  const svg = map.querySelector('svg');
  const viewport = map.querySelector<HTMLElement>('.map-viewport');
  const dialog = map.querySelector<HTMLDialogElement>('.map-picker');
  const list = map.querySelector<HTMLUListElement>('.map-picker-places');
  const description = dialog?.querySelector('p');
  const close = map.querySelector<HTMLButtonElement>('.map-picker-close');
  if (!svg || !viewport || !dialog || !list || !description || !close || typeof dialog.showModal !== 'function') return;

  const anchors = [...svg.querySelectorAll<SVGAElement>('a[data-place-name]')];
  let returnFocus: SVGAElement | HTMLElement = viewport;
  let gesture: { id: number; x: number; y: number; started: number; invalid: boolean; ended: boolean } | undefined;

  // Do not capture pointers or prevent pointer events: native pan, pinch and context menus remain available.
  svg.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) {
      if (gesture) gesture.invalid = true;
      return;
    }
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, started: event.timeStamp, invalid: false, ended: false };
  });
  window.addEventListener('pointerdown', (event) => {
    if (gesture && !gesture.ended && event.pointerId !== gesture.id) gesture.invalid = true;
  });
  window.addEventListener('pointermove', (event) => {
    if (gesture && !gesture.ended && event.pointerId === gesture.id && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.invalid = true;
  }, { passive: true });
  window.addEventListener('pointerup', (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8 || event.timeStamp - gesture.started > 700) gesture.invalid = true;
    gesture.ended = true;
  });
  window.addEventListener('pointercancel', (event) => {
    if (gesture?.id === event.pointerId) {
      gesture.invalid = true;
      gesture.ended = true;
    }
  });
  // A scroll can move the map under a stationary finger; movement distance alone is insufficient.
  window.addEventListener('scroll', () => {
    if (gesture && !gesture.ended) gesture.invalid = true;
  }, { capture: true, passive: true });
  window.visualViewport?.addEventListener('resize', () => {
    if (gesture && !gesture.ended) gesture.invalid = true;
  }, { passive: true });

  svg.addEventListener('click', (event) => {
    // Enter/assistive activation and alternate browsing actions retain native anchor behavior.
    if (event.detail === 0 || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const tap = gesture;
    gesture = undefined;
    if (!tap) return;
    if (tap.invalid || !tap.ended) {
      event.preventDefault();
      return;
    }

    // Read centers afresh, including the current scroll position, SVG size and browser zoom.
    // Ignore event.target: a different place's dot, hit circle or label may be painted on top.
    // Mobile browsers can adjust a click's coordinates to a nearby link: use the original contact.
    const candidates = nearbyPlaces(anchors.flatMap((anchor) => {
      const dot = anchor.querySelector<SVGCircleElement>('.place-dot');
      const matrix = dot?.getScreenCTM();
      const href = anchor.getAttribute('href');
      if (!dot || !matrix || !href) return [];
      const center = new DOMPoint(dot.cx.baseVal.value, dot.cy.baseVal.value).matrixTransform(matrix);
      return [{ x: center.x, y: center.y, href, name: anchor.dataset.placeName!, anchor }];
    }), tap.x, tap.y);

    // A label away from any center is still its own ordinary link.
    if (!candidates.length) return;
    event.preventDefault();
    if (candidates.length === 1) {
      window.location.assign(candidates[0].href);
      return;
    }

    returnFocus = candidates[0].anchor;
    list.replaceChildren(...candidates.map(({ href, name }) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = href;
      link.textContent = name;
      item.append(link);
      return item;
    }));
    description.textContent = `اختر الموضع، ${arCount(candidates.length, ['موضع واحد', 'موضعان', 'مواضع', 'موضعًا'])}`;
    dialog.showModal();
    list.querySelector('a')?.focus();
  }, { capture: true });

  close.addEventListener('click', () => dialog.close());
  // Native Escape closes the dialog and provides focus containment while it is open.
  dialog.addEventListener('close', () => returnFocus.focus({ preventScroll: true }));
});

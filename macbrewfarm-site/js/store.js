// Tiny shared state between the scroll code (DOM) and the 3D scene.

export const store = {
  heroP: 0, // 0..1 while the hero scrolls out
  cockP: 0, // 0..1 across the pinned cocktail section
  active: 0, // index of the active cocktail
  visible: true, // is the 3D layer on screen?
  liquid: '#D6284F',
  foam: 0.35,
  garnish: '#F2A72B',
};

const subs = new Set();

export function set(patch) {
  Object.assign(store, patch);
  subs.forEach((fn) => fn(store));
}

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

// Intro progress of the glass (0 -> 1), animated once after the preloader.
export const intro = { v: 0 };

// "Site is ready" hook (fires after the preloader exits).
let ready = false;
const queue = [];
export function onReady(fn) {
  if (ready) fn();
  else queue.push(fn);
}
export function markReady() {
  ready = true;
  queue.splice(0).forEach((fn) => fn());
}

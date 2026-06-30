import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.SVGElement = dom.window.SVGElement;
global.Node = dom.window.Node;
global.Image = dom.window.Image;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
global.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };

const mod = await import('./src/components/EffectsStudio.js');
console.log('EffectsStudio:', typeof mod.EffectsStudio);
console.log('Smoke import: OK');

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LAYOUT,
  PRODUCT,
  editableGesturePoints,
  effectiveCommandFor,
  gesturePoints,
  shortcutNameFor,
} from './gestures';

/**
 * The command model is the project's single source of truth, and the site
 * makes public claims about it ("nine commands: seven fixed, two shortcuts").
 * These tests pin the arithmetic and the two facts that have been got wrong
 * before: which pinky point carries Shortcut 1, and that Emergency is an
 * activation variation rather than a tenth command.
 */
describe('command model', () => {
  it('has eight contact points carrying nine commands', () => {
    expect(gesturePoints).toHaveLength(PRODUCT.contactPoints);
    expect(PRODUCT.contactPoints).toBe(8);
    expect(PRODUCT.fixedCommands + PRODUCT.personalShortcuts).toBe(PRODUCT.commands);
    expect(PRODUCT.commands).toBe(9);
  });

  it('exposes exactly two remappable points', () => {
    expect(editableGesturePoints).toHaveLength(PRODUCT.personalShortcuts);
    expect(editableGesturePoints.map((p) => p.id)).toEqual(['pinky-tip', 'pinky-base']);
  });

  it('puts Shortcut 1 on the pinky tip and Shortcut 2 on the base', () => {
    expect(shortcutNameFor('pinky-tip')).toBe('Shortcut 1');
    expect(shortcutNameFor('pinky-base')).toBe('Shortcut 2');
  });

  it('every contact point has a unique id and a screen-reader label', () => {
    expect(new Set(gesturePoints.map((p) => p.id)).size).toBe(gesturePoints.length);
    for (const point of gesturePoints) {
      expect(point.srLabel.length).toBeGreaterThan(0);
      expect(point.simKey).toMatch(/^[1-8]$/);
    }
  });
});

describe('effectiveCommandFor', () => {
  it('resolves fixed points to their fixed command', () => {
    expect(effectiveCommandFor(DEFAULT_LAYOUT, 'index-tip').name).toBe('Confirm');
    expect(effectiveCommandFor(DEFAULT_LAYOUT, 'middle-base').name).toBe('Next');
    expect(effectiveCommandFor(DEFAULT_LAYOUT, 'index-tip').kind).toBe('fixed');
  });

  it('resolves shortcut points through the active layout', () => {
    const custom = { ...DEFAULT_LAYOUT, 'pinky-base': 'call-favorite' };
    expect(effectiveCommandFor(custom, 'pinky-base').name).toBe('Call favourite contact');
    expect(effectiveCommandFor(custom, 'pinky-base').kind).toBe('shortcut');
  });

  it('treats Emergency as a held variation of the pinky tip, not a tenth command', () => {
    const tap = effectiveCommandFor(DEFAULT_LAYOUT, 'pinky-tip', false);
    const hold = effectiveCommandFor(DEFAULT_LAYOUT, 'pinky-tip', true);
    expect(tap.kind).toBe('shortcut');
    expect(hold.kind).toBe('emergency');
    expect(hold.name).toMatch(/Emergency/);
  });

  it('never silently loses a command name', () => {
    for (const point of gesturePoints) {
      expect(effectiveCommandFor(DEFAULT_LAYOUT, point.id).name).toBeTruthy();
    }
  });
});

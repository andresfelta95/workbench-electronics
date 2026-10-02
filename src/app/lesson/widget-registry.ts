import type { Type } from '@angular/core';

/**
 * Every interactive instrument the lesson prose can reference with
 * `::widget{type="…"}`. Each entry is a dynamic import, so a lesson only ever
 * downloads the instruments it actually uses.
 */
export const WIDGETS: Record<string, () => Promise<Type<unknown>>> = {
  'ohm-law': () => import('../widgets/ohm-law/ohm-law').then((m) => m.OhmLawWidget),
  'resistor-network': () =>
    import('../widgets/resistor-network/resistor-network').then((m) => m.ResistorNetworkWidget),
  divider: () => import('../widgets/divider/divider').then((m) => m.DividerWidget),
  kirchhoff: () => import('../widgets/kirchhoff/kirchhoff').then((m) => m.KirchhoffWidget),
};

/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from "zod";

/* zod schemas */
export const zPanel = z.object({
  id: z.string(),
  icon: z.string().nullish(),
  type: z.enum(["web", "static", "extension"]),
  url: z.string(),
  width: z.number(),
  userContextId: z.number().nullish(),
  zoomLevel: z.number().nullish(),
  userAgent: z.string().nullish(),
});

export const zPanels = z.array(zPanel);

export const zWindowPanelSidebarState = z.object({
  panels: zPanels,
  currentPanelId: z.string().nullish(),
});

export const zPanelSidebarConfig = z.object({
  globalWidth: z.number(),
  autoUnload: z.boolean(),
  position_start: z.boolean(),
  displayed: z.boolean(),
});

export const zPanelSidebarData = z.object({
  data: zPanels,
});

/* Export as types */
export type Panel = z.infer<typeof zPanel>;
export type Panels = z.infer<typeof zPanels>;
export type WindowPanelSidebarState = z.infer<typeof zWindowPanelSidebarState>;
export type PanelSidebarConfig = z.infer<typeof zPanelSidebarConfig>;
export type PanelSidebarData = z.infer<typeof zPanelSidebarData>;

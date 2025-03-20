/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowserActionUtils } from "@core/utils/browser-action";
import tabsGridStyle from "./tabgrid-manager.css?inline";
import { TabGridMenu } from "./tabgridmenu";
const { CustomizableUI } = ChromeUtils.importESModule(
  "resource:///modules/CustomizableUI.sys.mjs"
);

export class CTabsGrid {
  private StyleElement = () => {
    return <style>{tabsGridStyle}</style>;
  };

  constructor() {
    BrowserActionUtils.createMenuToolbarButton(
      "tabs-grid",
      "tabs-grid",
      "tabs-grid-menu",
      <TabGridMenu />,
      null,
      null,
      CustomizableUI.AREA_NAVBAR,
      this.StyleElement(),
      16
    );
  }
}

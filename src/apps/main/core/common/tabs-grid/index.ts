/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NoraComponentBase, noraComponent } from "@core/utils/base";
import { onCleanup, render } from "@nora/solid-xul";
import { CTabsGrid } from "./tabgrid-manager";
import { TabGridMenu } from "./tabgridmenu";
@noraComponent(import.meta.hot)
export default class TabsGrid extends NoraComponentBase {
  init() {
    new CTabsGrid();
    window.gBrowser.tabContainer.addEventListener("TabOpen", updatePageCount);
    window.gBrowser.tabContainer.addEventListener("TabClose", updatePageCount);
    updatePageCount();
    renderTabItem();
    onCleanup(() => {
      window.gBrowser.tabContainer.removeEventListener(
        "TabOpen",
        updatePageCount,
      );
      window.gBrowser.tabContainer.removeEventListener(
        "TabClose",
        updatePageCount,
      );
      document.getElementById("tabGridContainer")?.remove();
    });
  }
}

function updatePageCount() {
  setTimeout(function () {
    document.getElementById("tabs-grid").label =
      window.gBrowser.tabs.length.toString();
  }, 400);
}

function renderTabItem() {
  setTimeout(function () {
    render(TabGridMenu, document.getElementById("browser"), {
      marker: document.getElementById("browser").lastChild,
      hotCtx: import.meta.hot,
    });
  }, 400);
}

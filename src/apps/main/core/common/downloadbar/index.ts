/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createRootHMR, render } from "@nora/solid-xul";
import { DonwloadBar } from "./downloadbar";
import { DownloadBarManager } from "./downloadbar-manager";

export let manager: DownloadBarManager;

export function init() {
  createRootHMR(
    () => {
      manager = new DownloadBarManager();
    },
    import.meta.hot,
  );
  manager.init();
  console.log(manager.showDownloadBar());
  if (!manager.showDownloadBar()) {
    return;
  }
  document.getElementById("downloadsPanel")?.remove();
  render(DonwloadBar, document.getElementById("appcontent"), {
    hotCtx: import.meta.hot,
  });
  console.log("init download bar");
  window.DownloadsPanel.hidePanel = () => {
    return;
  };
  delete window.DownloadsView.contextMenu;
  delete window.DownloadsPanel.panel;
  delete window.DownloadsPanel.richListBox;
  window.DownloadsPanel.panel = document.getElementById("downloadsPanel");
  window.DownloadsPanel.richListBox =
    document.getElementById("downloadsListBox");
  window.DownloadsView.contextMenu = document.getElementById(
    "downloadsContextMenu",
  );
  window.DownloadsPanel._initialized = false;
  window.DownloadsPanel.initialize();
  window.DownloadsView.onDownloadAdded_hook =
    window.DownloadsView.onDownloadAdded;
  window.DownloadsView.onDownloadAdded = (download) => {
    document.getElementById("downloadsListBox").scrollLeft = 0;
    DownloadsView.onDownloadAdded_hook(download);
  };
  const scrollElem = document.getElementById("downloadsListBox");
  scrollElem?.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) {
      return;
    }
    e.preventDefault();
    scrollElem.scrollLeft += e.deltaY * 10;
  });

  import.meta.hot?.accept((m) => {
    m?.initDownloadbar();
  });
}
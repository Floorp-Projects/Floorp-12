/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { config } from "../../designs/configs";
import { createEffect } from "solid-js";

export class gFloorpMultirowTabbarClass {
  private static instance: gFloorpMultirowTabbarClass;
  public static getInstance() {
    if (!gFloorpMultirowTabbarClass.instance) {
      gFloorpMultirowTabbarClass.instance = new gFloorpMultirowTabbarClass();
    }
    return gFloorpMultirowTabbarClass.instance;
  }

  private get arrowScrollbox(): XULElement | null {
    return document.querySelector("#tabbrowser-arrowscrollbox");
  }

  private get scrollboxPart(): XULElement | null {
    return this.arrowScrollbox
      ? this.arrowScrollbox.querySelector("[part=scrollbox]")
      : null;
  }

  private get aTabHeight(): number {
    return (
      document.querySelector(".tabbrowser-tab:not([hidden='true'])")
        ?.clientHeight || 30
    );
  }

  private get isMaxRowEnabled(): boolean {
    return config().tabbar.multiRowTabBar.maxRowEnabled;
  }
  private get getMultirowTabMaxHeight(): number {
    return config().tabbar.multiRowTabBar.maxRow * this.aTabHeight;
  }

  private setMultirowTabMaxHeight() {
    if (!this.isMaxRowEnabled) {
      return;
    }
    this.scrollboxPart?.setAttribute(
      "style",
      `max-height: ${this.getMultirowTabMaxHeight}px !important;`,
    );
  }

  private removeMultirowTabMaxHeight() {
    this.scrollboxPart?.removeAttribute("style");
  }

  constructor() {
    createEffect(() => {
      config().tabbar.tabbarStyle === "multirow"
        ? this.setMultirowTabMaxHeight()
        : this.removeMultirowTabMaxHeight();
    });
  }
}

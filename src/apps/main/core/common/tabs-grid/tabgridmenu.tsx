/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

const closeTab = (e) => {
  e.target.parentNode.parentNode.classList.add("closeAnim");
  setTimeout(function () {
    const elemIndex = Array.from(
      document.getElementById("tabGridContainer").children
    ).indexOf(e.target.parentNode.parentNode);
    e.target.parentNode.parentNode.remove();
    gBrowser.removeTab(window.gBrowser.tabs[elemIndex]);
  }, 90);
};
const selectTab = (e) => {
  const elemIndex = Array.from(
    document.getElementById("tabGridContainer").children
  ).indexOf(e.target.parentNode);
  gBrowser.tabContainer.selectedIndex = elemIndex;
};

export function TabGridMenu() {
  const [GridItems, setGridItems] = createSignal([]);
  document.getElementById("tabGridContainer")?.remove();
  createEffect(() => {
    const loadThumbnail = async () => {
      const items = [];
      for (const elem of window.gBrowser.tabs) {
        const canvas = document.createElement("canvas");
        canvas.width = 280 * window.devicePixelRatio;
        canvas.height = 140 * window.devicePixelRatio;
        canvas.className = "gridContent";
        canvas.tabIndex = 0;
        canvas.addEventListener("click", selectTab);
        canvas.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            selectTab(e);
          }
        });
        try {
          await window.PageThumbs.captureTabPreviewThumbnail(
            elem.linkedBrowser,
            canvas
          );
          items.push(
            <div class="tabGridItem" role="button">
              <div class="gridTitle" onclick={selectTab}>
                <button class="closeTab" onclick={closeTab}>
                  ✕
                </button>
                <p class="titleText">{elem.label}</p>
              </div>
              {canvas}
            </div>
          );
          setGridItems([...items]);
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadThumbnail();
  });

  return (
    <Portal mount={document.getElementById("browser")}>
      <div id="tabGridContainer">{GridItems()}</div>
    </Portal>
  );
}

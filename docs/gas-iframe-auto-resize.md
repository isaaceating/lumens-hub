# GAS iframe auto-resize standard

Use this standard for Google Apps Script Web Apps embedded in Lumens Portal.

## 1. Code.js

Make sure the Web App allows iframe embedding:

```js
return t.evaluate()
  .setTitle(page.title)
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

## 2. Index.html CSS

Add this to the page CSS:

```css
html,
body {
  overflow-x: hidden;
}
```

Do not set `overflow-y: hidden` until the Portal auto-resize behavior is confirmed.

## 3. Index.html script

Paste this reusable block near the end of the main script, before `</script>`.

```js
/* ===============================
   Lumens Portal iframe auto-resize
   Reusable for GAS Web Apps
================================ */

const LUMENS_PORTAL_PARENT_ORIGIN = "*";
const LUMENS_PORTAL_RESIZE_MESSAGE_TYPE = "LUMENS_PORTAL_IFRAME_HEIGHT";

let __lumensResizeTimer = null;

function notifyLumensPortalHeight() {
  try {
    const appEl = document.getElementById("app");

    const height = Math.ceil(
      Math.max(
        document.body.scrollHeight || 0,
        document.documentElement.scrollHeight || 0,
        document.body.offsetHeight || 0,
        document.documentElement.offsetHeight || 0,
        appEl ? appEl.scrollHeight : 0,
        appEl ? appEl.offsetHeight : 0
      )
    );

    window.parent.postMessage(
      {
        type: LUMENS_PORTAL_RESIZE_MESSAGE_TYPE,
        height: height,
        href: window.location.href
      },
      LUMENS_PORTAL_PARENT_ORIGIN
    );
  } catch (err) {
    console.error("Failed to notify Lumens Portal height:", err);
  }
}

function scheduleLumensPortalHeightNotify() {
  window.clearTimeout(__lumensResizeTimer);
  __lumensResizeTimer = window.setTimeout(notifyLumensPortalHeight, 80);
}

window.addEventListener("load", function () {
  notifyLumensPortalHeight();

  setTimeout(notifyLumensPortalHeight, 300);
  setTimeout(notifyLumensPortalHeight, 800);
  setTimeout(notifyLumensPortalHeight, 1500);
  setTimeout(notifyLumensPortalHeight, 3000);
});

window.addEventListener("resize", scheduleLumensPortalHeightNotify);

if (window.ResizeObserver) {
  const resizeObserver = new ResizeObserver(scheduleLumensPortalHeightNotify);

  window.addEventListener("load", function () {
    resizeObserver.observe(document.body);

    const appEl = document.getElementById("app");
    if (appEl) resizeObserver.observe(appEl);
  });
}

if (window.MutationObserver) {
  const mutationObserver = new MutationObserver(scheduleLumensPortalHeightNotify);

  window.addEventListener("load", function () {
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  });
}
```

## 4. Recommended explicit calls

When your app replaces large page sections with `innerHTML`, opens/closes modal UI, changes pages, filters tables, or loads async data, call:

```js
scheduleLumensPortalHeightNotify();
```

For example, call it after rendering a table, after returning home, after entering a department, and after opening or closing a modal.

## Fallback behavior

Lumens Portal remains backward-compatible. If an embedded Web App does not send the `LUMENS_PORTAL_IFRAME_HEIGHT` message, the iframe keeps its fallback height and internal scrolling remains usable.

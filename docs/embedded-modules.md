# Embedded module behavior

Lumens Portal supports auto-resizing Google Apps Script embeds through `window.postMessage`.

## Message type

Embedded apps should send this message to the parent window:

```js
window.parent.postMessage(
  {
    type: "LUMENS_PORTAL_IFRAME_HEIGHT",
    height: document.documentElement.scrollHeight
  },
  "*"
);
```

## Backward compatibility

If an embedded Web App does not send the resize message, Lumens Portal keeps the fallback iframe height and allows iframe internal scrolling. This means older embedded apps remain usable.

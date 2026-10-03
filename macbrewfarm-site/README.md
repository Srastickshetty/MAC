# Mac Brew Farm, Bengaluru: website

A 3D, scroll-animated, front-end-only site. No build step.

- 3D cocktail glass (three.js) that changes drink as you scroll
- GSAP ScrollTrigger + Lenis smooth scroll (pinned sections, horizontal kitchen scroll, growing video)
- Tabbed menu styled like the printed menus
- Uses the client's own photos and videos (compressed, in `media/`)

## Run it locally
The site must be served over http (not opened by double-click), because it uses ES modules.

    python3 -m http.server 8080      # then open http://localhost:8080
    # or
    npx serve .

It needs internet on first load: three.js, GSAP, Lenis (jsDelivr CDN) and Google Fonts.

## Deploy
Drag this whole folder into Netlify Drop, or `vercel` / Cloudflare Pages / GitHub Pages. No settings needed.
After deploying, change the `og:image` line in `index.html` to the full URL, e.g. `https://yourdomain.com/media/og.jpg`.

## Edit content
Everything editable is in `js/data.js`:
- `site`: address, hours, phone, WhatsApp, Instagram, email. Fill them in and they appear in "Find us". Empty = hidden.
- `cocktails`: name, price, ingredients, glass colour, foam, garnish colour, optional photo.
- `menu`: salads, mains, desserts. Lines marked `CHECK` need client confirmation (see NOTES-FOR-CLIENT.md).

## How it behaves
- Visitors with "reduce motion" on, or if the libraries fail to load, get a calm static layout (no pinning, no 3D, cocktail grid, videos with controls).
- If WebGL is unavailable the 3D layer is skipped and a photo is shown instead.
- Phones get a lighter layout (kitchen becomes a swipe row, glass sits above the text).

## Files
    index.html        page structure
    css/styles.css    design system and all sections
    js/main.js        boot, preloader, smooth scroll, background colour
    js/scene.js       three.js glass, liquid, hops, gold dust
    js/cocktails.js   pinned cocktail section (drives the glass)
    js/sections.js    hero intro, parallax, kitchen scroll, feast video, reels
    js/menu.js        menu tabs and sheet
    js/ui.js          nav, anchors, cursor
    js/data.js        all editable content
    media/            images (webp) and videos (mp4, audio removed)

## Later: bundling / self-hosting
For production you can download the three CDN libraries into `js/vendor/` and point the importmap and script tags at them, so the site has no third-party dependency except fonts.

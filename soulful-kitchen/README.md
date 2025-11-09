# Soulful Kitchen — Moments & More

A production-ready single-page marketing site for the Soulful Kitchen cloud kitchen brand. The site is built with vanilla HTML, CSS, JavaScript, and PHP so it can be deployed directly to cPanel or any standard shared hosting environment.

## Project structure

```
soulful-kitchen/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  └─ main.js
├─ form-handler.php
├─ success.html
├─ README.md
├─ data/
│  └─ submissions.csv
└─ assets/
   ├─ logo.svg
   ├─ hero-poster.svg
   ├─ hero-poster-mobile.svg
   ├─ placeholder-hero.mp4
   ├─ placeholder-hero.webm
   └─ fonts/
       ├─ README.txt
       └─ (add font files here)
```

## Replace brand assets

Update the placeholder assets with brand-ready files to launch:

| File | Description |
|------|-------------|
| `assets/logo.svg` | Replace with your production Soulful Kitchen logo. |
| `assets/hero-poster.svg` and `assets/hero-poster-mobile.svg` | Replace with poster images that match your hero video. |
| `assets/placeholder-hero.mp4` and `assets/placeholder-hero.webm` | Replace with optimized background hero video files (use the same filenames). |
| `assets/fonts/Lufga-Regular.woff2`, `Lufga-Bold.woff2`, `BlackForoth-Regular.woff2`, `IndigoDaisy-Regular.woff2` | Drop licensed font files into the `assets/fonts/` folder using these exact filenames. |

The CSS `@font-face` rules are already configured to look for these filenames and fall back to system fonts when missing.

## Configure email delivery

1. Open `form-handler.php` and set the `$TO_EMAIL` variable to the email address that should receive new booking submissions.
2. Ensure your hosting environment allows PHP’s native `mail()` function to send email. If messages do not arrive:
   - Configure PHP mail logs / SPF records with your provider.
   - Or integrate SMTP using a library such as [PHPMailer](https://github.com/PHPMailer/PHPMailer). Contact us if you’d like an SMTP-ready version of `form-handler.php`.

## Uploading to cPanel

1. Zip the `soulful-kitchen` folder.
   ```bash
   zip -r soulful-kitchen.zip soulful-kitchen
   ```
2. Log in to cPanel and open **File Manager**.
3. Navigate to `public_html/` (or the desired subdirectory).
4. Upload `soulful-kitchen.zip` via the **Upload** button.
5. Once uploaded, select the zip file and choose **Extract**. The structure above will be placed directly in `public_html/soulful-kitchen/`.
6. If you want the site at the root domain, move the files (not the folder) into `public_html/`.

## Permissions and data storage

- The PHP handler appends submissions to `data/submissions.csv`. Ensure the `data/` directory is writable by the web server (typically permissions `755` or `775`).
- The CSV file is seeded with a header row. Each new submission appends a new row with ISO timestamps.

## Testing submissions

1. Open `index.html` in a browser via your hosting URL.
2. Submit both the quick lead form and the full booking form. You should receive:
   - A toast confirmation in the browser (for AJAX submissions).
   - An email delivered to the address configured in `$TO_EMAIL`.
   - A new row in `data/submissions.csv` for each submission. Download the CSV via cPanel to verify data.
3. Disable JavaScript in your browser or use a no-script extension to confirm the fallback POST submission redirects to `success.html` and still records entries in the CSV/email.

## Notes

- The hero video is muted, loops, and includes desktop/mobile poster fallbacks for performance.
- The “Watch video” button loads the YouTube embed only after click. Replace `data-youtube-id="YOUTUBE_VIDEO_ID"` in `index.html` with your actual video ID.
- Forms provide accessible labels, keyboard focus states, and server-side validation.
- Modal dialog behavior supports keyboard focus trapping and ESC to close.

Enjoy creating soulful culinary moments!

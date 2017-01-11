/**
 * Configuration for head elements added during the creation of index.html.
 *
 * All href attributes are added the publicPath (if exists) by default.
 * You can explicitly hint to prefix a publicPath by setting a boolean value to a key that has
 * the same name as the attribute you want to operate on, but prefix with =
 *
 * Example:
 * { name: "msapplication-TileImage", content: "/assets/icon/ms-icon-144x144.png", "=content": true },
 * Will prefix the publicPath to content.
 *
 * { rel: "apple-touch-icon", sizes: "57x57", href: "/assets/icon/apple-icon-57x57.png", "=href": false },
 * Will not prefix the publicPath on href (href attributes are added by default
 *
 */
module.exports = {
  link: [
    /** <link> tags for "apple-touch-icon" (AKA Web Clips). **/
    { rel: "apple-touch-icon", sizes: "180x180", href: "/assets/favicon/apple-touch-icon.png" },

    /** <link> tags for android web app icons **/
    { rel: "icon", type: "image/png", sizes: "192x192", href: "/assets/favicon/android-chrome-192x192.png" },
    { rel: "icon", type: "image/png", sizes: "512x512", href: "/assets/favicon/android-chrome-512x512.png" },

    /** <link> tags for favicons **/
    { rel: "icon", href: "/assets/favicon/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/assets/favicon/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/assets/favicon/favicon-16x16.png" },

    /** <link> tags for a Web App Manifest **/
    { rel: "manifest", href: "/assets/favicon/manifest.json" }
  ],
  meta: [
    { name: "msapplication-TileColor", content: "#00bcd4" },
    { name: "msapplication-TileImage", content: "/assets/favicon/mstile-icon-150x150.png", "=content": true },
    { name: "theme-color", content: "#00bcd4" }
  ]
};

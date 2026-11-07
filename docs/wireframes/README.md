# Wireframes

Low-fidelity sketches of each page. Replace or add images (photos of paper sketches, Figma, or Excalidraw exports) in this folder.

## Shared layout (all pages)
```
+--------------------------------------------------------------+
| LOGO  Home About Equipment Requests Submit Summary Sign In [Dark]|
+--------------------------------------------------------------+
|                                                              |
|                      PAGE CONTENT                            |
|                                                              |
+--------------------------------------------------------------+
|                 © Year Project Name · CSC441                  |
+--------------------------------------------------------------+
```

## Home (`index.html`)
```
+--------------------------------------------------------------+
|                   Welcome to Project Name                     |
|             One-sentence description of the site              |
|                    [ Browse the catalog ]                     |
+--------------------------------------------------------------+
|  Featured                                                    |
|  +------------+  +------------+  +------------+              |
|  | Feature 1  |  | Feature 2  |  | Feature 3  |              |
|  +------------+  +------------+  +------------+              |
|                   Good afternoon! (JS)                        |
+--------------------------------------------------------------+
```

## About (`about.html`)
```
| About Us - purpose paragraph                                  |
| Our Team                                                      |
| +--------+-----------+------------------+                     |
| | Name   | Role      | Pages/Features   |                     |
| +--------+-----------+------------------+                     |
| Built With - bullet list                                      |
```

## Catalog (`catalog.html`)
```
| Catalog                                                       |
| [ Search items...            ]   <- JS filters cards live     |
| +--------+  +--------+  +--------+                            |
| | Item   |  | Item   |  | Item   |   <- JS builds cards       |
| | $19.99 |  | $29.99 |  | $9.99  |                            |
| +--------+  +--------+  +--------+                            |
```

## Reviews (`reviews.html`)
```
| Leave a Review                                                |
| Name   [__________]                                           |
| Rating [Choose... v]                                          |
| Review [____________________]                                 |
|        [ Post review ]   <- JS validates, adds to list        |
| Recent Reviews                                                |
| +----------------------------------------------+              |
| | Sample User – 5/5  Great site, easy to use.  |              |
| +----------------------------------------------+              |
```

## Contact (`contact.html`)
```
| Contact Us                                                    |
| Name    [__________]                                          |
| Email   [__________]                                          |
| Phone   [__________] (optional)                               |
| Topic   [Choose... v]                                         |
| Message [____________________]   0 / 500 (JS counter)         |
|         [ Send message ]                                      |
| Thanks, Name! Your message was received.  (JS)                |
```

## Mobile (under 700px)
```
+--------------------------+
| LOGO        [Menu] [Dark]|
+--------------------------+
| Home                     |  <- menu opens/closes with JS
| About                    |
| ...                      |
+--------------------------+
| Content stacks in one    |
| column                   |
+--------------------------+
```

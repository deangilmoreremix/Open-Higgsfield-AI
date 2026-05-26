# Missing Assets Documentation

## External Assets (Upstream URLs)

The following assets are externally hosted and loaded from the cloud. They are functional but not bundled locally:

### Avatar Presets
| Name | URL | Status |
|------|-----|--------|
| Priya | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Priya.webp | Works |
| Elena | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Elena.webp | Works |
| Kai | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Kai.webp | Works |
| Sora | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Sora.webp | Works |
| Minji | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Minji.webp | Works |
| Margot | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Margot.webp | Works |
| Niko | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Niko.webp | Works |
| Jin | https://d3adwkbyhxyrtq.cloudfront.net/web-app/Jin.webp | Works |

### UGC Video Presets
| Name | URL | Status |
|------|-----|--------|
| UGC | https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc.mp4 | Works |
| Tutorial | https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_how_to.mp4 | Works |
| Unboxing | https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_unboxing.mp4 | Works |
| Hyper Motion | https://d3adwkbyhxyrtq.cloudfront.net/web-app/hyper-motion-mini.mp4 | Works |
| Product Review | https://d3adwkbyhxyrtq.cloudfront.net/web-app/product_review.mp4 | Works |
| TV Spot | https://d3adwkbyhxyrtq.cloudfront.net/web-app/tv-spot-mini.mp4 | Works |

## Missing Local Assets

None - The external assets work correctly. For a fully standalone app, consider downloading these assets to `src/assets/`.

## Favicon

The app currently uses `/favicon.svg` which doesn't exist. To add:
- Create `public/favicon.svg` or
- Add a favicon in `index.html`
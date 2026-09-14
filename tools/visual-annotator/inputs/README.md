# Vision Architecture Input Directory

Drop your full-page screenshots and companion text files in this folder.

### File Naming Convention:
For every screenshot or UI mockup, provide an image and an exact matching `.txt` file:

- **Screenshot**: `[page-name].png` (or `.jpg`, `.jpeg`, `.webp`)
- **User Notes**: `[page-name].txt`

### Example:
```text
inputs/vision/
├── lookbook_runway.png
├── lookbook_runway.txt
├── artisan_profile.png
├── artisan_profile.txt
├── bespoke_bridal.png
└── bespoke_bridal.txt
```

### What to put in the `.txt` file:
Include any context that the image alone doesn't convey:
- Business goals for this page
- Required character limits or editorial rules
- Interactive behaviors (e.g. "The radar dots should animate on hover and show boning details")
- Target URLs for buttons and CTAs
- Relationships with other pages

---

### How to Trigger Analysis:
Prompt the agent:
> *"Run vision analysis on inputs/vision/"*

The **shopify-vision-architect** subagent will evaluate each pair, extract layout structures and candidate entities, and compile a consolidated schema hierarchy into `docs/architecture/vision_analysis/`!

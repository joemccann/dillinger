# Dillinger - Copilot Instructions

## Design Context

### Users
Developers, technical writers, and content creators who need a distraction-free, cloud-connected markdown editor. They arrive with a document to write or edit, often context-switching from code. The job: write and preview markdown with zero friction, optionally syncing to GitHub, Dropbox, Google Drive, OneDrive, or Bitbucket.

### Brand Personality
**Focused. Capable. Understated.** The interface should feel like a precision instrument — confident and quiet, never flashy.

### Emotional Goal
**Calm focus.** The UI recedes; the content leads.

### Aesthetic Direction
- Polished minimal. Clean lines, generous whitespace, refined typography.
- Full theme support: light, dark, and system-preference modes.
- Dark chrome sidebar/navbar with light editor is the signature look in light mode.
- Anti-references: cluttered toolbars, gratuitous gradients, loud colors.

### Design Principles
1. **Content is king.** Every UI element exists to serve the writing experience.
2. **Quiet confidence.** Plum accent (#35D7BB) is the single bright voice in a neutral palette.
3. **Polished, not decorated.** Quality is in spacing, alignment, transitions, typography — never ornament.
4. **Progressive disclosure.** Show what's needed, hide what isn't.
5. **Accessible by default.** WCAG AA minimum. Focus rings, contrast, keyboard nav, reduced-motion.

### Key Design Tokens
- Brand accent: `#35D7BB` (plum)
- Backgrounds: `#ffffff` (light), `#2B2F36` (sidebar), `#373D49` (navbar), `#1D212A` (highlight)
- Text: `#373D49` (primary), `#ffffff` (invert), `#A0AABF` (muted)
- Fonts: Source Sans 3 (UI), Georgia (prose), Ubuntu Mono (code)
- See `.impeccable.md` for full design system reference.

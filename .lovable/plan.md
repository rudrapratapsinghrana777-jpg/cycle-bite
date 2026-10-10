# Add a clean FAQ section above the footer

## What you'll see

A "Questions & answers" card sits just above the footer line, with your five questions listed as tap-to-expand rows. Tapping a question opens its answer; tapping again closes it. The first question starts open so the section never looks empty. No model names, no API or prompt wording anywhere in the visible text.

## What changes

- **New FAQ block** placed between the PMS craving swaps section and the footer line in the home page, so it reads as the last thing before "General wellness guidance, not medical advice."
- **Five entries, copy used word for word** from your message:
  1. How does CycleBite protect my private health data?
  2. How do the meal recommendations change when I have severe pain?
  3. Can I use CycleBite if my cycle length varies?
  4. How do PMS Craving Swaps work?
  5. Is CycleBite a replacement for professional medical advice?
- **Nothing else is touched** — your cycle inputs, pain picker, recipes, and craving swaps stay exactly as they are.

## Technical details

- Built with the accordion component already in the project (`src/components/ui/accordion.tsx`, Radix-based) — no new packages, so nothing to install.
- A `Faq` component is added to `src/routes/index.tsx` alongside the existing `RecipeEngine` and `CravingSwaps` components, following the same single-file pattern.
- Questions and answers live in a small `FAQS` array at the top of the file, next to the existing `CRAVINGS` array, so the wording is easy to edit later.
- Styling reuses the existing design tokens only: `card-soft` for the card, `section-title` for the heading, plus `text-muted-foreground` and `font-display` for the answers. A `HelpCircle` icon from lucide-react matches the icons used by the other section headings. No hardcoded colors.
- Accessible by default from the accordion primitive: each question is a real button with an expanded/collapsed state, keyboard operable, and the answer text is hidden from screen readers while collapsed.
- Mobile behaviour: the accordion is a single column that stretches to the card width, with tap targets at least 44px tall.
- The section is static content, so it renders even with no cycle date entered and with the AI key absent — matching the project rule that core content must not depend on the AI.
- Em dashes and curly apostrophes in your copy are kept exactly as written.

## How it gets checked

- Confirm the build passes and the page renders with the FAQ in place above the footer.
- Open the FAQ in the preview, tap each question, and verify answers expand and collapse.
- Check the section at a narrow phone width and confirm no text clipping or horizontal scroll.
- Confirm no AI model name, provider, or prompt wording appears in the visible FAQ text.

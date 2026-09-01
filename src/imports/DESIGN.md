# Akses Instan ke 40.000+ Buku Anak & Lainnya

## Mission
Create implementation-ready, token-driven UI guidance for Akses Instan ke 40.000+ Buku Anak & Lainnya that is optimized for consistency, accessibility, and fast delivery across dashboard web app.

## Brand
- Product/brand: Akses Instan ke 40.000+ Buku Anak & Lainnya
- URL: https://www.getepic.com/
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Roboto`, `font.family.stack=Roboto, sans-serif`, `font.size.base=18px`, `font.weight.base=400`, `font.lineHeight.base=28px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=13.33px`, `font.size.md=14px`, `font.size.lg=16px`, `font.size.xl=18px`, `font.size.2xl=20px`, `font.size.3xl=24px`, `font.size.4xl=40px`
- Color palette: `color.text.primary=#3c4b62`, `color.surface.base=#000000`, `color.text.tertiary=#ffffff`, `color.text.inverse=#0a96e6`, `color.surface.raised=#e9559b`
- Spacing scale: `space.1=2px`, `space.2=4px`, `space.3=5px`, `space.4=8px`, `space.5=12px`, `space.6=16px`, `space.7=20px`, `space.8=22px`
- Radius/shadow/motion tokens: `radius.xs=6px`, `radius.sm=24px`, `radius.md=100px`, `radius.lg=9999px` | `shadow.1=rgba(255, 255, 255, 0.9) 0px 0px 0px 3px` | `motion.duration.instant=100ms`, `motion.duration.fast=200ms`, `motion.duration.normal=250ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: buttons (58), links (43), cards (15), inputs (5).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.

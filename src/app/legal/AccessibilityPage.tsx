/** Accessibility statement — a commitment page, honest about limits. */
import LegalPage from './LegalPage';

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility statement"
      updated="3 August 2026"
      intro={
        <p>
          Tactiq is a research project about accessible interaction, so this website treats
          accessibility as a core requirement, not a compliance chore. This page describes what we
          aim for, what we test, and how to tell us when something falls short.
        </p>
      }
      sections={[
        {
          heading: 'What we aim for',
          body: (
            <>
              <p>
                The site targets WCAG 2.2 AA. Concretely: text contrast of at least 4.5:1 (3:1 for
                large text and interface boundaries), full keyboard operability with visible focus,
                a logical heading structure with landmarks and a skip link, interactive targets of
                at least 44×44 CSS pixels, and content that stays complete at 200% zoom and with
                reduced motion enabled.
              </p>
              <p>
                The interactive command map has a full text alternative ("View all commands as a
                list"), forms have visible labels and described errors, FAQ answers open without
                JavaScript, and the 3D concept model is optional, never auto-loading or
                auto-rotating.
              </p>
            </>
          ),
        },
        {
          heading: 'How we test',
          body: (
            <p>
              Automated checks run with axe on every significant change, alongside manual passes
              with keyboard only, VoiceOver on Safari, 200% and 400% zoom, reduced-motion mode, and
              320–390px viewports. Testing with NVDA and TalkBack is planned as part of the wider
              research programme — we say so rather than claim coverage we haven't done.
            </p>
          ),
        },
        {
          heading: 'Known limitations',
          body: (
            <>
              <p>
                The account dashboard's simulated data views are dense and still being improved for
                screen-reader flow. The optional 3D model depends on a third-party viewer whose
                internal announcements we don't fully control.
              </p>
            </>
          ),
        },
        {
          heading: 'Tell us what breaks',
          body: (
            <p>
              If anything on this site is hard to use with your setup, that is a bug in the thing
              we care most about. Email hello@tactiq.app and it goes to the top of the list.
            </p>
          ),
        },
      ]}
    />
  );
}

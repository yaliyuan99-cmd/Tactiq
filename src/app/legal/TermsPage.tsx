import LegalPage from './LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      title="User Agreement & Terms of Service"
      updated="16 July 2026"
      intro={
        <p>
          These Terms of Service (the &ldquo;Terms&rdquo;) form a legal agreement
          between you and Tactiq. By creating an account, using the Tactiq app, or
          using a Tactiq device, you agree to these Terms. Please read them
          carefully.
        </p>
      }
      sections={[
        {
          heading: '1. Eligibility',
          body: (
            <p>
              You must be at least 13 years old (or the age of digital consent in
              your country) to use Tactiq. If you use Tactiq on behalf of an
              organisation, you represent that you are authorised to accept these
              Terms for it.
            </p>
          ),
        },
        {
          heading: '2. Your account',
          body: (
            <p>
              You are responsible for keeping your login credentials secure and
              for all activity that happens under your account. Notify us
              promptly if you believe your account has been compromised.
            </p>
          ),
        },
        {
          heading: '3. Acceptable use',
          body: (
            <>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use Tactiq for any unlawful or harmful purpose.</li>
                <li>
                  Reverse engineer, tamper with, or attempt to bypass security or
                  device safeguards.
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the
                  service.
                </li>
                <li>Resell or commercially exploit the service without our consent.</li>
              </ul>
            </>
          ),
        },
        {
          heading: '4. Purchases and subscriptions',
          body: (
            <p>
              Prices for devices and any subscription features are shown at
              checkout. Taxes and shipping may apply. Where a subscription is
              offered, it renews for successive periods until cancelled, and you
              can cancel at any time effective at the end of the current period.
            </p>
          ),
        },
        {
          heading: '5. Intellectual property',
          body: (
            <p>
              Tactiq and its software, designs, and branding are owned by us and
              our licensors. We grant you a limited, non-exclusive,
              non-transferable licence to use the app and device for personal use,
              subject to these Terms.
            </p>
          ),
        },
        {
          heading: '6. Disclaimers',
          body: (
            <p>
              Tactiq is provided &ldquo;as is&rdquo; and &ldquo;as
              available.&rdquo; To the fullest extent permitted by law, we
              disclaim all warranties, express or implied, including
              merchantability and fitness for a particular purpose. Tactiq is a
              convenience accessory and should not be relied on for
              safety-critical tasks.
            </p>
          ),
        },
        {
          heading: '7. Limitation of liability',
          body: (
            <p>
              To the maximum extent permitted by law, Tactiq will not be liable
              for any indirect, incidental, special, or consequential damages, or
              for any loss of data or profits, arising out of your use of the
              service.
            </p>
          ),
        },
        {
          heading: '8. Termination',
          body: (
            <p>
              You may stop using Tactiq at any time. We may suspend or terminate
              your access if you violate these Terms or if we discontinue the
              service, in which case we will give reasonable notice where
              practicable.
            </p>
          ),
        },
        {
          heading: '9. Changes to these Terms',
          body: (
            <p>
              We may update these Terms from time to time. If we make material
              changes we will update the date above and notify you where
              appropriate. Continued use after changes take effect means you
              accept the updated Terms.
            </p>
          ),
        },
        {
          heading: '10. Governing law',
          body: (
            <p>
              These Terms are governed by the laws of the jurisdiction in which
              Tactiq operates, without regard to conflict-of-law principles.
            </p>
          ),
        },
      ]}
    />
  );
}

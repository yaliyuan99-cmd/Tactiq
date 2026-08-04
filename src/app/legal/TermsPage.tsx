import LegalPage from './LegalPage';

/**
 * Honesty rule for this page: there is nothing for sale, no app and no device.
 * These terms cover the website, accounts, saved demo layouts and research
 * updates — nothing more.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="4 August 2026"
      intro={
        <>
          <p>
            These Terms of Service (the &ldquo;Terms&rdquo;) are an agreement between you and
            the Tactiq student research project. They cover this website, user accounts, saved
            demo command layouts and research updates. Tactiq has no product for sale, no
            companion app and no physical device — nothing in these Terms creates any purchase,
            subscription or hardware relationship.
          </p>
          <p>
            These Terms were written by the project team and have not yet been reviewed by a
            lawyer. They are flagged for professional legal review.
          </p>
        </>
      }
      sections={[
        {
          heading: '1. Eligibility',
          body: (
            <p>
              You must be at least 13 years old (or the age of digital consent where you live)
              to create an account.
            </p>
          ),
        },
        {
          heading: '2. Your account',
          body: (
            <p>
              You are responsible for keeping your login credentials secure and for activity
              under your account. Tell us promptly at hello@tactiq.app if you believe your
              account has been compromised. You can ask us to delete your account and its data
              at any time.
            </p>
          ),
        },
        {
          heading: '3. What the service is (and is not)',
          body: (
            <>
              <p>The website currently lets you:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Read about the research project and its evidence.</li>
                <li>Create an account and save sample command layouts.</li>
                <li>Explore an interface preview of a future companion dashboard.</li>
                <li>Receive occasional research updates if you opt in.</li>
              </ul>
              <p>
                It does not sell anything, connect to any hardware, or provide any assistive
                functionality itself. All ring behaviour described on this site is design
                intent, simulation or a pre-registered target — not a shipped capability.
              </p>
            </>
          ),
        },
        {
          heading: '4. Acceptable use',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Do not use the website for any unlawful or harmful purpose.</li>
              <li>Do not attempt to access other users&rsquo; accounts or data.</li>
              <li>Do not interfere with or disrupt the service.</li>
              <li>Do not misrepresent the project&rsquo;s research status when sharing it.</li>
            </ul>
          ),
        },
        {
          heading: '5. Intellectual property',
          body: (
            <p>
              The Tactiq name (a working title), this website, its designs and the project&rsquo;s
              research materials belong to the project team. You may share and discuss them with
              attribution; you may not present them as your own work or use them commercially
              without permission.
            </p>
          ),
        },
        {
          heading: '6. Research disclaimers',
          body: (
            <p>
              Tactiq is a student research prototype. The website is provided &ldquo;as
              is&rdquo; for information and demonstration. Performance figures are
              pre-registered targets or simulation results, not achieved results, and nothing on
              this site is medical advice or an assistive-technology recommendation.
            </p>
          ),
        },
        {
          heading: '7. Limitation of liability',
          body: (
            <p>
              To the maximum extent permitted by law — including the consumer guarantees that
              cannot be excluded under Australian law — the project team&rsquo;s liability in
              connection with this website is limited to resupplying the service. This is a
              free, non-commercial student research website.
            </p>
          ),
        },
        {
          heading: '8. Termination',
          body: (
            <p>
              You may stop using the website or delete your account at any time. We may suspend
              accounts that violate these Terms, or wind the service down as the research
              project evolves, with reasonable notice where practicable.
            </p>
          ),
        },
        {
          heading: '9. Changes to these Terms',
          body: (
            <p>
              If we make material changes we will update the date above and email account
              holders before the changes take effect.
            </p>
          ),
        },
        {
          heading: '10. Governing law',
          body: (
            <p>
              These Terms are governed by the laws of New South Wales, Australia, and disputes
              are subject to the courts of New South Wales.
            </p>
          ),
        },
      ]}
    />
  );
}

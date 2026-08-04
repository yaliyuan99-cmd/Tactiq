import LegalPage from './LegalPage';

/**
 * Honesty rule for this page: Tactiq is a research prototype with no wearable
 * ring, no companion app and no sensor pipeline. The policy therefore
 * separates data collected TODAY from data that MAY be collected in future,
 * and never describes future collection in the present tense.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="4 August 2026"
      intro={
        <>
          <p>
            This Privacy Policy explains what information the Tactiq website collects, why we
            collect it, and the choices you have. Tactiq is a student research project designing
            a smart ring for blind and low-vision people. No wearable ring exists yet: there is
            no companion app, no device data, and no sensor processing. The only thing that
            collects information today is this website.
          </p>
          <p>
            This policy was written by the project team and has not yet been reviewed by a
            lawyer. It is flagged for professional legal review before any user testing begins.
          </p>
        </>
      }
      sections={[
        {
          heading: 'Information we collect today',
          body: (
            <>
              <p>
                <strong className="text-foreground">Account information.</strong> If you create
                an account we store your name, your email address, and your answer (optional) to
                how you would like to be involved in the project. Passwords are hashed and
                managed by our authentication provider (Supabase); Tactiq never stores or sees
                your password itself.
              </p>
              <p>
                <strong className="text-foreground">Saved demo layouts.</strong> If you save
                command layouts in the dashboard, we store those layouts with your account. They
                are sample configurations — there is no ring for them to sync to.
              </p>
              <p>
                <strong className="text-foreground">Project-update sign-ups.</strong> If you
                join the follow-the-project list, we store your name, email and optional
                involvement answer so we can send occasional research updates.
              </p>
              <p>
                We do not run analytics or advertising trackers, we do not set marketing
                cookies, and we do not collect location information. The only cookies or stored
                tokens are the ones our authentication provider needs to keep you signed in, and
                browser-only preferences (such as theme and accessibility settings) that never
                leave your device.
              </p>
            </>
          ),
        },
        {
          heading: 'Information we may collect in the future',
          body: (
            <>
              <p>
                If the project ever reaches working hardware and you choose to pair a ring, we
                would need to handle additional data such as device identifiers, calibration
                information and command events. <strong className="text-foreground">None of
                this is collected today</strong>, and we will update this policy — and ask for
                your consent where required — before any of it begins.
              </p>
              <p>
                If we run research studies with participants, participant information will be
                handled under a separate consent process reviewed with our research mentors,
                not under this general website policy.
              </p>
            </>
          ),
        },
        {
          heading: 'How we use information',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>To operate your account and store your saved demo layouts.</li>
              <li>To send project updates you asked for — roughly monthly at most.</li>
              <li>To respond when you email us.</li>
              <li>To keep the website secure.</li>
            </ul>
          ),
        },
        {
          heading: 'How we share information',
          body: (
            <p>
              We do not sell personal information, ever. Data is processed by the service
              providers that run this site — Supabase (authentication and database) and Netlify
              (hosting) — only to the extent needed to provide those services, or where required
              by law. These providers may process data outside Australia; we choose providers
              with standard security certifications, but flag this for the legal review noted
              above.
            </p>
          ),
        },
        {
          heading: 'Data retention, export and deletion',
          body: (
            <p>
              We keep your information while your account exists or while you remain on the
              update list. Email{' '}
              <a href="mailto:hello@tactiq.app" className="text-foreground underline underline-offset-4">
                hello@tactiq.app
              </a>{' '}
              at any time to unsubscribe, export a copy of your data, or delete your account and
              everything associated with it — we action these requests by hand and confirm when
              done.
            </p>
          ),
        },
        {
          heading: 'Security',
          body: (
            <p>
              Connections to this site are encrypted in transit, authentication is handled by
              Supabase with industry-standard password hashing, and database access is
              restricted so accounts can only read their own records. No method of storage is
              perfectly secure, and we do not claim otherwise — which is one more reason we
              collect as little as possible.
            </p>
          ),
        },
        {
          heading: 'Australian privacy context',
          body: (
            <p>
              Tactiq is run by students in New South Wales, Australia. We aim to follow the
              spirit of the Australian Privacy Principles even where a student project falls
              below the thresholds at which they formally apply.
            </p>
          ),
        },
        {
          heading: "Children's privacy",
          body: (
            <p>
              This website is not directed to children under 13, and we do not knowingly
              collect personal information from them.
            </p>
          ),
        },
        {
          heading: 'Changes to this policy',
          body: (
            <p>
              When we make material changes — for example, if hardware testing begins — we will
              update the date above and email account holders and list members before the
              changes take effect.
            </p>
          ),
        },
      ]}
    />
  );
}

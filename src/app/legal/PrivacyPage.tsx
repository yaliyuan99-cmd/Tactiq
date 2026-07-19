import LegalPage from './LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="16 July 2026"
      intro={
        <p>
          This Privacy Policy explains what information Tactiq collects, why we
          collect it, and the choices you have. Tactiq is a wearable device that
          lets you control your phone from your body, so protecting the data
          that flows between your ring, your phone, and our services is central
          to how we build the product.
        </p>
      }
      sections={[
        {
          heading: 'Information we collect',
          body: (
            <>
              <p>
                <strong className="text-foreground">Account information.</strong>{' '}
                When you create an account we store your name, email address, and
                an encrypted representation of your password.
              </p>
              <p>
                <strong className="text-foreground">Device data.</strong> To make
                gesture control work we process motion and interaction signals
                from your ring. Where possible this processing happens on your
                device; only the data needed to sync settings and provide
                support reaches our servers.
              </p>
              <p>
                <strong className="text-foreground">Usage data.</strong> We
                collect basic diagnostics — app version, crash reports, and
                aggregate feature usage — to keep the product reliable.
              </p>
            </>
          ),
        },
        {
          heading: 'How we use information',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide, maintain, and improve Tactiq.</li>
              <li>To personalise your gestures, themes, and device settings.</li>
              <li>To respond to support requests and send service notices.</li>
              <li>To detect, prevent, and address security or technical issues.</li>
            </ul>
          ),
        },
        {
          heading: 'How we share information',
          body: (
            <p>
              We do not sell your personal information. We share data only with
              service providers who help us operate Tactiq (for example hosting
              and authentication), and only to the extent needed to perform those
              services, or where required by law.
            </p>
          ),
        },
        {
          heading: 'Data retention',
          body: (
            <p>
              We keep your information for as long as your account is active. You
              can ask us to delete your account and associated data at any time,
              after which we remove it except where we are legally required to
              retain certain records.
            </p>
          ),
        },
        {
          heading: 'Your choices and rights',
          body: (
            <p>
              Depending on where you live, you may have the right to access,
              correct, export, or delete your personal information, and to object
              to certain processing. To exercise any of these rights, contact us
              using the email below and we will respond within a reasonable time.
            </p>
          ),
        },
        {
          heading: 'Security',
          body: (
            <p>
              We use encryption in transit, access controls, and regular reviews
              to protect your data. No method of transmission or storage is
              perfectly secure, but we work continuously to safeguard your
              information.
            </p>
          ),
        },
        {
          heading: "Children's privacy",
          body: (
            <p>
              Tactiq is not directed to children under 13, and we do not
              knowingly collect personal information from them.
            </p>
          ),
        },
        {
          heading: 'Changes to this policy',
          body: (
            <p>
              We may update this Privacy Policy from time to time. When we make
              material changes we will update the date above and, where
              appropriate, notify you in the app.
            </p>
          ),
        },
      ]}
    />
  );
}

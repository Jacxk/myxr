import { type Metadata } from "next";
import Link from "next/link";
import { LEGAL_LAST_UPDATED } from "~/utils/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export const dynamic = "force-static";

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-6 text-sm text-gray-500">
        Last Updated: {LEGAL_LAST_UPDATED.TERMS.toLocaleDateString()}
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Eligibility</h2>
        <p>
          You must log in with a valid Discord account to use myxr. We do not
          knowingly collect information from users under the age of 13. If
          you&apos;re under 13, please do not use myxr.
        </p>

        <h2 className="text-xl font-semibold">2. Account & Discord Login</h2>
        <p>
          Your use of myxr is tied to your Discord account. By logging in, you
          grant us access to basic account info (username, avatar, ID, and email
          if permitted). You&apos;re responsible for all activity under your
          account.
        </p>

        <h2 className="text-xl font-semibold">3. User Content</h2>
        <p>
          You may upload sound files to myxr. By uploading, you confirm you have
          the rights to do so, and that your content doesn&apos;t infringe on
          others&apos; rights or contain harmful, illegal, or offensive
          material. We may remove any content that violates these rules.
        </p>

        <h2 className="text-xl font-semibold">4. Use of Content</h2>
        <p>
          Uploaded content may be publicly visible and downloadable by other
          users for use with Discord. myxr is not responsible for how third
          parties use downloaded content.
        </p>

        <h2 className="text-xl font-semibold">5. Paid Features</h2>
        <p>
          myxr is currently free to use. In the future, we may offer premium
          features, which will be clearly explained along with their pricing and
          refund policies.
        </p>

        <h2 className="text-xl font-semibold">6. Prohibited Conduct</h2>
        <ul className="list-disc pl-6">
          <li>Do not upload illegal or copyrighted material you do not own.</li>
          <li>Do not harass, abuse, or spam other users.</li>
          <li>
            Do not attempt to hack, reverse-engineer, or disrupt the platform.
          </li>
        </ul>

        <h2 className="text-xl font-semibold">7. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to myxr at
          any time for violations of these terms.
        </p>

        <h2 className="text-xl font-semibold">8. Data & Privacy</h2>
        <p>
          We only collect data provided by your Discord account. For more
          details, see our{" "}
          <Link
            href="/legal/privacy-policy"
            className="text-blue-600 underline"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <h2 className="text-xl font-semibold">9. Changes to the Terms</h2>
        <p>
          We may update these Terms occasionally. Major changes will be
          announced, and the &quot;Last Updated&quot; date will be revised
          accordingly.
        </p>

        <h2 className="text-xl font-semibold">10. Contact</h2>
        <p>
          If you have questions or concerns, contact us at:{" "}
          <a href="mailto:support@myxr.cc" className="text-blue-500">
            support@myxr.cc
          </a>
        </p>
      </section>
    </main>
  );
}

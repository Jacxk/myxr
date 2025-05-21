import { type Metadata } from "next";
import { LEGAL_LAST_UPDATED } from "~/utils/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export const dynamic = "force-static";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-6 text-sm text-gray-500">
        Last Updated: {LEGAL_LAST_UPDATED.PRIVACY.toLocaleDateString()}
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Data We Collect</h2>
        <p>
          We only collect data that you allow Discord to share with us when you
          log in. This typically includes:
        </p>
        <ul className="list-disc pl-6">
          <li>Discord ID</li>
          <li>Username</li>
          <li>Avatar</li>
          <li>Email address</li>
          <li>Access Token</li>
        </ul>

        <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
        <p>Your data is used to:</p>
        <ul className="list-disc pl-6">
          <li>Identify you in the app</li>
          <li>Link your uploaded sounds to your account</li>
          <li>Allow social features like likes and follows</li>
          <li>Analyze usage patterns to improve the platform</li>
        </ul>

        <h2 className="text-xl font-semibold">3. Analytics & Tracking</h2>
        <p>
          We use <strong>PostHog</strong> to collect anonymous usage data. This
          helps us understand how users interact with myxr and where
          improvements can be made. PostHog may track things like page views,
          button clicks, and other interactions, but no personally identifiable
          Discord data is sent to PostHog.
        </p>

        <h2 className="text-xl font-semibold">4. Advertising</h2>
        <p>
          We use Google Ads to display advertisements on our platform. Google
          Ads uses cookies and similar technologies to serve ads based on your
          prior visits to our website and other sites. This allows us to provide
          you with relevant advertisements and helps support our service.
        </p>
        <p>
          You can opt out of personalized advertising by visiting Google&apos;s
          Ads Settings page. Additionally, you can opt out of third-party
          vendor&apos;s use of cookies for personalized advertising by visiting
          www.aboutads.info.
        </p>

        <h2 className="text-xl font-semibold">5. Data Sharing</h2>
        <p>
          We do not sell your personal data to third parties. However, we may
          share certain information with:
        </p>
        <ul className="list-disc pl-6">
          <li>
            Google Ads for advertising purposes (as described in the Advertising
            section)
          </li>
          <li>Service providers who help us operate our platform</li>
          <li>Analytics providers (PostHog) for improving our service</li>
        </ul>
        <p>
          Any data shared with these third parties is done so in accordance with
          this privacy policy and applicable data protection laws. Your personal
          Discord data remains protected and is not shared with advertising
          partners.
        </p>

        <h2 className="text-xl font-semibold">6. Cookies & Local Storage</h2>
        <p>
          We may use cookies or local storage to store session information and
          improve user experience. This includes login sessions and user
          preferences.
        </p>

        <h2 className="text-xl font-semibold">7. Data Retention</h2>
        <p>
          We retain your data as long as your account is active. If you wish to
          delete your data, please contact us using the information below.
        </p>

        <h2 className="text-xl font-semibold">8. Security</h2>
        <p>
          We take reasonable steps to protect your data but cannot guarantee
          complete security. Always use strong passwords and secure your Discord
          account.
        </p>

        <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any significant
          changes will be posted here, and the &quot;Last Updated&quot; date
          will reflect the changes.
        </p>

        <h2 className="text-xl font-semibold">10. Contact</h2>
        <p>
          For questions or concerns, contact us at:{" "}
          <a href="mailto:support@myxr.cc" className="text-blue-500">
            support@myxr.cc
          </a>
        </p>
      </section>
    </main>
  );
}

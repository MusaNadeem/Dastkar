// Legal pages (Terms / Privacy / IP Policy / Refunds). Static content.
// NOTE: placeholder copy — have a lawyer review before launch.
import { Navigate, useParams } from 'react-router-dom';

const DOCS = {
  terms: {
    title: 'Terms of Service',
    sections: [
      ['Using Dastkar', 'Dastkar is a marketplace connecting independent Pakistani makers with buyers. By using the platform you agree to these terms and to act lawfully and in good faith.'],
      ['Accounts', 'You sign in with Google. You are responsible for activity on your account. Sellers additionally accept the IP declaration during onboarding.'],
      ['Orders and payments', 'Buyers may pay by cash on delivery or online. During the MVP, online payments are simulated. Prices are set by sellers and shown in Pakistani Rupees.'],
      ['Prohibited conduct', 'No counterfeit goods, no infringing content, no fraudulent activity. We may remove listings and suspend or ban accounts that break these rules.'],
      ['Liability', 'Sellers are responsible for the items they list and sell. Dastkar acts as a neutral venue and is not a party to the sale.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Your name and email from Google sign-in, your role, shop details, orders, shipping addresses, and content you upload.'],
      ['How we use it', 'To operate the marketplace: authentication, listings, orders, fulfillment, and support. We do not sell your personal data.'],
      ['Sharing', 'Buyers and sellers see the information needed to complete an order (for example, a shipping address is shared with the relevant seller).'],
      ['Your choices', 'You can request access to or deletion of your data by contacting us.'],
    ],
  },
  ip: {
    title: 'Intellectual Property Policy',
    sections: [
      ['Original work only', 'Sellers declare at onboarding that everything they list is their own original work or that they hold the right to sell it.'],
      ['Reporting infringement', 'Anyone can report a listing they believe infringes their rights using the report button on the product page.'],
      ['Takedowns and strikes', 'Valid reports lead to the listing being taken down. Repeat infringement follows a three-strikes policy: warning, temporary suspension, then permanent ban.'],
      ['Counter-notice', 'A seller may contest a takedown; the report re-enters review flagged as disputed.'],
    ],
  },
  refunds: {
    title: 'Refund Policy',
    sections: [
      ['Delivery confirmation', 'Buyers confirm delivery once a parcel arrives. Report problems promptly so we can help resolve them.'],
      ['Custom orders', 'Custom commissions require a non-refundable deposit before work begins. The balance is due on approval of the final piece.'],
      ['Disputes', 'If something goes wrong, contact the seller first. Unresolved issues can be escalated to Dastkar for review.'],
    ],
  },
};

export default function Legal() {
  const { doc } = useParams();
  const d = DOCS[doc];
  if (!d) return <Navigate to="/legal/terms" replace />;
  return (
    <div className="wrap" style={{ maxWidth: 720, paddingBlock: 28 }}>
      <h1 className="h3" style={{ marginBottom: 6 }}>{d.title}</h1>
      <div className="mut" style={{ marginBottom: 20 }}>Draft — pending legal review.</div>
      {d.sections.map(([h, body]) => (
        <div key={h} style={{ marginBottom: 18 }}>
          <div className="h" style={{ marginBottom: 6 }}>{h}</div>
          <p className="sm" style={{ lineHeight: 1.65 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}

// Landing page composition. Order is deliberate: value prop -> what to browse ->
// who makes it -> how buying works -> custom orders -> trust -> seller pitch ->
// social proof -> questions -> final push. Each section is a distinct layout family.
import '../styles/landing.css';

import SiteNav from '../components/landing/SiteNav.jsx';
import Hero from '../components/landing/Hero.jsx';
import CategoryBento from '../components/landing/CategoryBento.jsx';
import FeaturedMakers from '../components/landing/FeaturedMakers.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import CustomOrders from '../components/landing/CustomOrders.jsx';
import BuyerProtection from '../components/landing/BuyerProtection.jsx';
import SellerCta from '../components/landing/SellerCta.jsx';
import Testimonials from '../components/landing/Testimonials.jsx';
import Faq from '../components/landing/Faq.jsx';
import FinalCta from '../components/landing/FinalCta.jsx';
import SiteFooter from '../components/landing/SiteFooter.jsx';

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <CategoryBento />
        <FeaturedMakers />
        <HowItWorks />
        <CustomOrders />
        <BuyerProtection />
        <SellerCta />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

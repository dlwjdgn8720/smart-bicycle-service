import HeroSection from "../components/home/HeroSection";
import ServiceNavigationTicker from "../components/home/ServiceNavigationTicker";
import FeatureSection from "../components/home/FeatureSection";
import PopularRouteSection from "../components/home/PopularRouteSection";
import CommunitySection from "../components/home/CommunitySection";
import ReviewSection from "../components/home/ReviewSection";
import AppDownloadSection from "../components/home/AppDownloadSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServiceNavigationTicker />
      <FeatureSection />
      <PopularRouteSection />
      <CommunitySection />
      <ReviewSection />
      <AppDownloadSection />
    </>
  );
}

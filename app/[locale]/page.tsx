import {
  Hero,
  SearchSection,
  CategoriesSection,
  PopularSection,
  WhySection,
  PrescriptionSection,
  ContactSection,
} from '@/components/sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SearchSection />
      <CategoriesSection />
      <PopularSection />
      <WhySection />
      <PrescriptionSection />
      <ContactSection />
    </>
  );
}

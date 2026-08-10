/**
 * Tactiq — main site. A single-page research narrative:
 * hero → everyday use → how it works → the command map → the prototype →
 * research → project status → FAQ → follow the project.
 *
 * Composition only: each section is its own component in src/app/home/.
 * There is deliberately no scroll-progress bar, no back-to-top button, no
 * entrance animation choreography — the content carries the page.
 */
import SiteHeader from './home/SiteHeader';
import Hero from './home/Hero';
import Scenarios from './home/Scenarios';
import Sequence from './home/Sequence';
import HandMap from './home/HandMap';
import DesignEvolution from './home/DesignEvolution';
import Prototype from './home/Prototype';
import Research from './home/Research';
import Timeline from './home/Timeline';
import FollowForm from './home/FollowForm';
import FaqSection from './components/FaqSection';
import SiteFooter from './components/SiteFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Scenarios />
        <Sequence />
        <HandMap />
        <DesignEvolution />
        <Prototype />
        <Research />
        <Timeline />
        <FaqSection />
        <FollowForm />
      </main>
      <SiteFooter />
    </div>
  );
}

import Head from "next/head";
import HeroSection from "./_components/HeroSection";
import OurFeatures from "./_components/OurFeatures";
import StepsSolution from "./_components/StepsSolution";

// Dynamic import
import dynamic from "next/dynamic";

const Specialities = dynamic(
  () => import("@/app/(public)/_components/Specialties"),
  {
    loading: () => (
      <div className="h-40 w-full animate-pulse bg-muted rounded-xl mt-8"></div>
    ),
  },
);

const TopRatedDoctors = dynamic(
  () => import("@/app/(public)/_components/TopRatedDoctors"),
  {
    loading: () => (
      <div className="h-64 w-full animate-pulse bg-muted rounded-xl mt-8"></div>
    ),
  },
);

const Steps = dynamic(() => import("@/app/(public)/_components/Steps"));
const Testimonials = dynamic(
  () => import("@/app/(public)/_components/Testimonials"),
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Life Care + - Find Your Perfect Doctor</title>
        <meta
          name="description"
          content="Discover top-rated doctors tailored to your needs with Life Care +. Get personalized recommendations and book appointments effortlessly."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HeroSection />
        <OurFeatures />
        <StepsSolution />
        <Specialities />
        <TopRatedDoctors />
        {/* <Steps /> */} {/* StepSolution component ar aita same. */}
        <Testimonials />
      </main>
    </>
  );
}

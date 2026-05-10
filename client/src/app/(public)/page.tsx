import Specialities from "@/app/(public)/_components/Specialties";
import Steps from "@/app/(public)/_components/Steps";
import Testimonials from "@/app/(public)/_components/Testimonials";
import TopRatedDoctors from "@/app/(public)/_components/TopRatedDoctors";
import Head from "next/head";
import HeroSection from "./_components/HeroSection";
import OurFeatures from "./_components/OurFeatures";

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
        {/* <Specialities /> */}
        {/* <TopRatedDoctors /> */}
        <Steps />
        <Testimonials />
      </main>
    </>
  );
}

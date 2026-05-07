import { Hero } from "@/features/home/components/Hero";
import Specialities from "@/features/home/components/Specialties";
import Steps from "@/features/home/components/Steps";
import Testimonials from "@/features/home/components/Testimonials";
import TopRatedDoctors from "@/features/home/components/TopRatedDoctors";
import Head from "next/head";

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
        <Hero />
        <Specialities />
        <TopRatedDoctors />
        <Steps />
        <Testimonials />
      </main>
    </>
  );
}

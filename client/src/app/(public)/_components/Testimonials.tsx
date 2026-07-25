import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { getReviews } from "@/app/(dashboard)/patient/dashboard/my-appointments/_services/review.service";
import { IReview } from "@/types/review.type";

const TestimonialCard = ({ review }: { review: IReview }) => {
  const patientName = review?.patient?.name || "Anonymous Patient";

  const patientImage =
    typeof review?.patient?.profilePhoto === "string"
      ? review?.patient?.profilePhoto
      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  console.log("patientImage", patientImage);
  return (
    <Card className="bg-background relative h-full">
      <CardContent className="p-8 h-full flex flex-col justify-between">
        <div>
          <Quote
            className="absolute top-4 left-4 text-primary opacity-20"
            size={48}
          />
          <div className="relative z-10">
            <p className="text-muted-foreground mb-6 line-clamp-4">
              "{review.comment}"
            </p>
          </div>
        </div>
        <div className="flex items-center relative z-10">
          <Image
            src={patientImage}
            alt={patientName}
            width={48}
            height={48}
            // unoptimized
            className="rounded-full object-cover w-12 h-12"
          />
          <div className="ml-4">
            <h4 className="font-bold text-foreground">{patientName}</h4>
            <p className="text-muted-foreground text-sm">Patient</p>
            <div className="flex mt-1">
              {[...Array(review.rating || 5)].map((_, i) => (
                <Star
                  key={i}
                  className="text-yellow-400 fill-current"
                  size={14}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Testimonials = async () => {
  const res = await getReviews("limit=3");
  const reviews: IReview[] = res?.data || [];

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-card py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground">
            What Our Client Says
          </h2>
          <p className="text-muted-foreground mt-4">
            We are committed to providing you with the best medical and
            healthcare services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {reviews.map((review) => (
            <TestimonialCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

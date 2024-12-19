import { PageAnchor } from "@/custom_components/anchor";
import { TypographyH3, TypographyP } from "@/custom_components/typography";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
        <TypographyH3 className="font-medium">404 Not Found</TypographyH3>
        <TypographyP className="mt-2 items-center">
          Oh no! You just got lost 😱!
        </TypographyP>
        <TypographyP className="flex items-center">
          Don&apos;t worry I got you!
          <PageAnchor
            href="/"
            text="Click here"
            className="text-[#3E69F4] inline mx-1 text-md"
          />
          to go back home.
        </TypographyP>
      </div>
    </div>
  );
}

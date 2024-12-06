import Logo from "@/custom_components/logo";
import {
  GradientButton,
  IconButton,
  SimpleButton,
} from "@/custom_components/buttons/buttons";
import {
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyMono,
  TypographyMuted,
  TypographyP,
  TypographyTextGradient,
} from "@/custom_components/typography";
import { Sun } from "lucide-react";
import {
  ForwardAnchor,
  GitHubAnchor,
  PageAnchor,
  XAnchor,
} from "@/custom_components/anchor";
import LightboxImage from "@/custom_components/Image";

const DesignPage = () => {
  return (
    <div className="w-full h-full pt-12 px-8 max-w-5xl mx-auto bg-primary-blue">
      <TypographyH2 text="Design System" className="border-b pb-2" />

      <div className="my-12 flex flex-col gap-y-4 items-start">
        <div className="flex flex-col">
          <TypographyH3 text="Logo" />
          <div className="ms-4">
            <Logo className="w-8" />
          </div>
        </div>

        <div className="flex flex-col">
          <TypographyH3 text="Colors" />

          <TypographyP text="Main:" className="mt-4" />
          <div className="w-12 h-12 bg-[#3E69F4] rounded-full border-2 ml-2" />

          <TypographyP text="Foreground:" className="mt-4" />
          <div className="w-12 h-12 bg-foreground rounded-full border-2 ml-2" />

          <TypographyP text="Accent:" className="mt-4" />
          <div className="w-12 h-12 bg-accent rounded-full border-2 ml-2" />

          <TypographyP text="Background:" className="mt-4" />
          <div className="w-12 h-12 bg-background rounded-full border-2 ml-2" />
        </div>

        <div className="flex flex-col mt-3">
          <TypographyH3 text="Typography" />
          <TypographyP text="Paragraph:" className="mt-4" />
          <TypographyP text="Design is the silent ambassador of your brand." />
          <TypographyP text="Mono:" className="mt-4" />
          <TypographyMono text="console.log('Hello world')" />
          <TypographyP text="Text gradient:" className="mt-4" />
          <TypographyTextGradient text="Design is the silent ambassador of your brand." />
          <TypographyP text="Blockquote:" className="mt-4" />
          <TypographyBlockquote text="Design is the silent ambassador of your brand." />
          <TypographyP text="Heading 1:" className="mt-4" />
          <TypographyH1 text="Design is the silent ambassador of your brand." />
          <TypographyP text="Heading 2:" className="mt-4" />
          <TypographyH2 text="Design is the silent ambassador of your brand." />
          <TypographyP text="Heading 3:" className="mt-4" />
          <TypographyH3 text="Design is the silent ambassador of your brand." />
          <TypographyP text="Heading 4:" className="mt-4" />
          <TypographyH4 text="Design is the silent ambassador of your brand." />
          <TypographyP text="Muted Text:" className="mt-4" />
          <TypographyMuted text="Design is the silent ambassador of your brand." />
        </div>

        <div className="my-4 flex flex-col items-start">
          <TypographyH3 text="Buttons" />

          <SimpleButton className="my-2">Button</SimpleButton>

          <GradientButton className="my-2">Button</GradientButton>

          <IconButton className="my-2">
            <Sun size={18} />
          </IconButton>

          <SimpleButton className="my-2" disabled>
            Button
          </SimpleButton>

          <IconButton className="my-2" disabled={true}>
            <Sun size={18} />
          </IconButton>

          <div className="mt-8 flex flex-col gap-y-2">
            <TypographyH3 text="Anchor" />
            <XAnchor />

            <GitHubAnchor />

            <ForwardAnchor
              text="Check out my this my github"
              href="https://github.com/Arun-kumar21"
            />

            <PageAnchor text="Design Page" href="/design" />

            <TypographyH2 text="Image" className="mt-4" />
            <LightboxImage
              src="https://images.unsplash.com/photo-1603705072970-6bc8755ae6a8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="image"
              width={600}
              height={400}
              layout="intrinsic"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPage;

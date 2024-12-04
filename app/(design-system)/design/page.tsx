import Logo from "@/custom_components/logo";
import ThemeToggle from "@/custom_components/theme-toggle";
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

const DesignPage = () => {
  return (
    <div className="w-full h-full pt-12 px-8">
      <TypographyH1 text="Design System" className="border-b pb-2" />

      <div className="my-12 flex flex-col gap-y-4 items-start">
        <div className="flex flex-col">
          <TypographyH3 text="Logo" />
          <div className="ms-4">
            <Logo className="w-8" />
          </div>
        </div>

        <div className="flex flex-col">
          <TypographyH3 text="Colors" />

          <TypographyP text="Primary:" className="mt-4" />
          <div className="w-12 h-12 bg-primary rounded-full border-2 ml-2" />

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

        <div className="flex flex-col">
          <TypographyH3 text="Buttons" />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default DesignPage;

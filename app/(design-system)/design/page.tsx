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
  TypographyInlineCode,
  TypographyMono,
  TypographyMuted,
  TypographyP,
  TypographyTextGradient,
} from "@/custom_components/typography";
import { Sun } from "lucide-react";
import {
  BackwardAnchor,
  ForwardAnchor,
  GitHubAnchor,
  PageAnchor,
  XAnchor,
} from "@/custom_components/anchor";
import LightboxImage from "@/custom_components/Image";
import { OrderedList, UnorderedList } from "@/custom_components/list";
import { Slider } from "@/components/ui/slider";
import {
  BaseCard,
  DepthCard,
  HeaderCard,
  TitleCard,
} from "@/custom_components/card";
import {
  DangerPill,
  InfoPill,
  SuccessPill,
  WarningPill,
} from "@/custom_components/pills";
import {
  Callout,
  DangerCallout,
  InfoCallout,
} from "@/custom_components/callouts";
import CodeBlock from "@/custom_components/code-block";
import CollapsibleSummary from "@/custom_components/summary";
import CommandMenu from "@/custom_components/command-menu";
import ThemeSwitcher from "@/custom_components/buttons/theme-switcher";

const DesignPage = () => {
  return (
    <div className="w-full h-full pt-12 px-8 max-w-5xl mx-auto">
      <TypographyH2 text="Design System" className="border-b pb-2" />

      <div className="my-12 flex flex-col gap-y-4">
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

        <div className="my-4">
          <TypographyH3 text="Buttons" />

          <SimpleButton className="my-2">Button</SimpleButton>

          <div>
            <GradientButton className="my-2">Button</GradientButton>
          </div>

          <IconButton className="my-2">
            <Sun size={18} />
          </IconButton>

          <ThemeSwitcher />
          <SimpleButton className="my-2" disabled>
            Button
          </SimpleButton>

          <IconButton className="my-2" disabled={true}>
            <Sun size={18} />
          </IconButton>

          <div className="mt-8 flex flex-col gap-y-2">
            <div className="flex flex-col gap-y-4">
              <TypographyH3 text="Anchor" />
              <XAnchor />

              <GitHubAnchor />

              <BackwardAnchor text="Home" href="/" />

              <ForwardAnchor
                text="Check out my github"
                href="https://github.com/Arun-kumar21"
              />

              <PageAnchor text="Design Page" href="/design" />
            </div>

            <TypographyH3 text="Lists" className="my-4" />
            <div className="flex justify-between max-w-lg">
              <UnorderedList items={["First", "Second", "Third"]} />

              <OrderedList items={["First", "Second", "Third"]} />
            </div>

            <TypographyH3 text="Slider" className="my-4" />
            <div className="flex justify-between max-w-lg gap-x-12">
              <Slider defaultValue={[65]} max={100} step={1} />

              <Slider disabled defaultValue={[12]} max={100} />
            </div>

            <div className="my-4 flex flex-col gap-y-4">
              <TypographyH3 text="Cards" className="my-4" />

              <BaseCard>Base Card</BaseCard>
              <TitleCard title="Title for the card">
                Card with <TypographyInlineCode text="title" /> prop
              </TitleCard>

              <HeaderCard
                header={<p className="text-sm">Some Custom Header</p>}
              >
                Card with Custom Header
              </HeaderCard>

              <DepthCard depth={1}>
                Card <TypographyInlineCode text="depth = 1" />
              </DepthCard>

              <DepthCard depth={2}>
                Card <TypographyInlineCode text="depth = 2" />
              </DepthCard>

              <DepthCard depth={3}>
                Card <TypographyInlineCode text="depth = 3" />
              </DepthCard>
            </div>

            <div className="flex flex-col gap-y-4 items-start">
              <TypographyH3 text="Pill" className="my-4" />

              <InfoPill>Info Pill</InfoPill>
              <SuccessPill>Success Pill</SuccessPill>
              <WarningPill>Warning Pill</WarningPill>
              <DangerPill>Danger Pill</DangerPill>
            </div>

            <div className="flex flex-col my-4">
              <TypographyH3 text="Callouts" className="my-4" />

              <InfoCallout>
                <TypographyP text="This is an info callout" />
              </InfoCallout>

              <Callout variant="info" actionText="Learn More">
                <TypographyP text="Info callout" />
              </Callout>

              <DangerCallout>
                <TypographyP text="This is a danger callout" />
              </DangerCallout>
            </div>

            <div>
              <TypographyH3 text="Inline Code" className="my-4" />
              <TypographyInlineCode text="const foo = function() {}" />
            </div>

            <div className="max-w-2xl">
              <TypographyH3 text="Code Blocks" className="my-4" />

              <TypographyP text="Basic" className="mt-4" />
              <CodeBlock codeString={exampleCodeString} language="javascript" />

              <TypographyP
                text="With title and highlighting"
                className="mt-4"
              />
              <CodeBlock
                codeString={exampleCodeString}
                language="javascript"
                title="Code snippet title"
                highlightedLines={[3, 4, 5]}
              />
            </div>

            <TypographyH3 text="Details/Summary" className="my-4" />
            <CollapsibleSummary
              summary="Summary: Some short text"
              content="Content: Some long text nested inside the component. Useful to avoid long, optional content. It can take some simple strings or some other custom React components. As you want!"
            />

            <TypographyH3 text="Command Menu" className="mt-4" />
            <div>
              <CommandMenu />
            </div>

            <TypographyH3 text="Image" className="my-4" />
            <LightboxImage
              src="https://images.unsplash.com/photo-1603705072970-6bc8755ae6a8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="image"
              caption="This image is from unsplash and is used for demo purpose"
              width={600}
              height={400}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPage;

let exampleCodeString = `console.log("Hello World");

function multiplyBy2( num ) {
  return num * 2;
}

let res = multiplyBy2(5);

console.log("Result of 5 * 2 :",res);`;

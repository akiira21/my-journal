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
import Sandpack from "@/custom_components/sandpack/sandpack";

const DesignPage = () => {
  return (
    <div className="w-full h-full pt-12 px-4 md:px-8 max-w-4xl mx-auto">
      <TypographyH2 className="border-b pb-2">Design System</TypographyH2>

      <div className="my-12 flex flex-col gap-y-4">
        <div className="flex flex-col">
          <TypographyH3>Logo</TypographyH3>
          <div className="ms-4">
            <Logo className="w-8" />
          </div>
        </div>

        <div className="flex flex-col">
          <TypographyH3>Colors</TypographyH3>

          <TypographyP className="mt-4">Main:</TypographyP>
          <div className="w-12 h-12 bg-[#3E69F4] rounded-full border-2 ml-2" />

          <TypographyP className="mt-4">Foreground:</TypographyP>
          <div className="w-12 h-12 bg-foreground rounded-full border-2 ml-2" />

          <TypographyP className="mt-4">Accent:</TypographyP>
          <div className="w-12 h-12 bg-accent rounded-full border-2 ml-2" />

          <TypographyP className="mt-4">Background:</TypographyP>
          <div className="w-12 h-12 bg-background rounded-full border-2 ml-2" />
        </div>

        <div className="flex flex-col mt-3">
          <TypographyH3>Typography</TypographyH3>
          <TypographyP className="mt-4">Paragraph:</TypographyP>
          <TypographyP>
            Design is the silent ambassador of your brand.
          </TypographyP>
          <TypographyP className="mt-4">Mono:</TypographyP>
          <TypographyMono>console.log('Hello world')</TypographyMono>
          <TypographyP className="mt-4">Text gradient:</TypographyP>
          <TypographyTextGradient>
            Design is the silent ambassador of your brand.
          </TypographyTextGradient>
          <TypographyP className="mt-4">Blockquote:</TypographyP>
          <TypographyBlockquote>
            Design is the silent ambassador of your brand.
          </TypographyBlockquote>
          <TypographyP className="mt-4">Heading 1:</TypographyP>
          <TypographyH1>
            Design is the silent ambassador of your brand.
          </TypographyH1>
          <TypographyP className="mt-4">Heading 2:</TypographyP>
          <TypographyH2>
            Design is the silent ambassador of your brand.
          </TypographyH2>
          <TypographyP className="mt-4">Heading 3:</TypographyP>
          <TypographyH3>
            Design is the silent ambassador of your brand.
          </TypographyH3>
          <TypographyP className="mt-4">Heading 4:</TypographyP>
          <TypographyH4>
            Design is the silent ambassador of your brand.
          </TypographyH4>
          <TypographyP className="mt-4">Muted Text:</TypographyP>
          <TypographyMuted>
            Design is the silent ambassador of your brand.
          </TypographyMuted>
        </div>

        <div className="my-4">
          <TypographyH3>Buttons</TypographyH3>

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
              <TypographyH3>Anchor</TypographyH3>
              <XAnchor />

              <GitHubAnchor />

              <BackwardAnchor text="Home" href="/" />

              <ForwardAnchor
                text="Check out my github"
                href="https://github.com/Arun-kumar21"
              />

              <PageAnchor text="Design Page" href="/design" />
            </div>

            <TypographyH3 className="my-4">Lists</TypographyH3>
            <div className="flex justify-between max-w-lg">
              <UnorderedList items={["First", "Second", "Third"]} />

              <OrderedList items={["First", "Second", "Third"]} />
            </div>

            <TypographyH3 className="my-4">Slider</TypographyH3>
            <div className="flex justify-between max-w-lg gap-x-12">
              <Slider defaultValue={[65]} max={100} step={1} />

              <Slider disabled defaultValue={[12]} max={100} />
            </div>

            <div className="my-4 flex flex-col gap-y-4">
              <TypographyH3 className="my-4">Cards</TypographyH3>

              <BaseCard>Base Card</BaseCard>
              <TitleCard title="Title for the card">
                Card with <TypographyInlineCode>title</TypographyInlineCode>{" "}
                prop
              </TitleCard>

              <HeaderCard
                header={<p className="text-sm">Some Custom Header</p>}
              >
                Card with Custom Header
              </HeaderCard>

              <DepthCard depth={1}>
                Card <TypographyInlineCode>depth = 1</TypographyInlineCode>
              </DepthCard>

              <DepthCard depth={2}>
                Card <TypographyInlineCode>depth = 2</TypographyInlineCode>
              </DepthCard>

              <DepthCard depth={3}>
                Card <TypographyInlineCode>depth = 3</TypographyInlineCode>
              </DepthCard>
            </div>

            <div className="flex flex-col gap-y-4 items-start">
              <TypographyH3 className="my-4">Pill</TypographyH3>

              <InfoPill>Info Pill</InfoPill>
              <SuccessPill>Success Pill</SuccessPill>
              <WarningPill>Warning Pill</WarningPill>
              <DangerPill>Danger Pill</DangerPill>
            </div>

            <div className="flex flex-col my-4">
              <TypographyH3 className="my-4">Callouts</TypographyH3>

              <InfoCallout>
                <TypographyP>This is an info callout</TypographyP>
              </InfoCallout>

              <Callout variant="info" actionText="Learn More">
                <TypographyP>Info callout</TypographyP>
              </Callout>

              <DangerCallout>
                <TypographyP>This is a danger callout</TypographyP>
              </DangerCallout>
            </div>

            <div>
              <TypographyH3 className="my-4">Inline Code</TypographyH3>
              <TypographyInlineCode>
                const foo = function() {}
              </TypographyInlineCode>
            </div>

            <div className="max-w-2xl">
              <TypographyH3 className="my-4">Code Blocks</TypographyH3>

              <TypographyP className="mt-4">Basic</TypographyP>
              <CodeBlock codeString={exampleCodeString} language="javascript" />

              <TypographyP className="mt-4">
                With title and highlighting
              </TypographyP>
              <CodeBlock
                codeString={exampleCodeString}
                language="javascript"
                title="Code snippet title"
                highlightedLines={[3, 4, 5]}
              />
            </div>

            <div className="my-4">
              <Sandpack files={files} template="vanilla" autorun />
            </div>

            <TypographyH3 className="my-4">Details/Summary</TypographyH3>
            <CollapsibleSummary
              summary="Summary: Some short text"
              content="Content: Some long text nested inside the component. Useful to avoid long, optional content. It can take some simple strings or some other custom React components. As you want!"
            />

            <TypographyH3 className="mt-4">Command Menu</TypographyH3>
            <CommandMenu />

            <TypographyH3 className="my-4">Image</TypographyH3>
            <LightboxImage
              src="https://images.unsplash.com/photo-1603705072970-6bc8755ae6a8?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max"
              alt="Random image"
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

const files = {};

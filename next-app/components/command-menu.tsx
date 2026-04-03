"use client";

import { useRouter } from "next/navigation";
import {
  SparklesIcon,
  HomeIcon,
  LayersIcon,
  RssIcon,
  SearchIcon,
  UserIcon,
  BookOpenTextIcon,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import instagramIcon from "@/assets/icons/icons8-instagram-96.png";

import { personalConfig } from "@/lib/personal-data";
import { apiFetch } from "@/lib/api";
import type { PostSummary, PostsPageResponse } from "@/lib/blog-types";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

type CommandLinkItem = {
  title: string;
  href: string;
  icon: React.ReactElement;
  openInNewTab?: boolean;
  shortcut?: string;
};

const MENU_LINKS: CommandLinkItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <HomeIcon />,
    shortcut: "GH",
  },
  {
    title: "Posts",
    href: "/posts",
    icon: <BookOpenTextIcon />,
    shortcut: "GP",
  },
  {
    title: "Assistant",
    href: "/assistant",
    icon: <SparklesIcon />,
    shortcut: "GA",
  },
  {
    title: "RSS",
    href: "/rss",
    icon: <RssIcon />,
    openInNewTab: true,
  },
];

const SECTION_LINKS: CommandLinkItem[] = [
  {
    title: "About",
    href: "/#about",
    icon: <UserIcon />,
  },
  {
    title: "Stack",
    href: "/#stack",
    icon: <LayersIcon />,
  },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M18.244 2H21l-6.56 7.5L22 22h-5.95l-4.65-6.08L6.07 22H3.3l7.02-8.02L2 2h6.1l4.2 5.55L18.244 2zm-1.04 18h1.53L7.25 3.9H5.63L17.204 20z" />
    </svg>
  );
}

function InstagramIcon() {
  return <img src={instagramIcon.src} alt="Instagram" className="size-4 rounded-sm" />;
}

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch posts when menu opens
  useEffect(() => {
    if (open && posts.length === 0) {
      setIsLoading(true);
      apiFetch<PostsPageResponse>("/posts?page=1&page_size=50")
        .then((data) => {
          setPosts(data.posts || []);
        })
        .catch(() => {
          // Silently fail - posts just won't show
          setPosts([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, posts.length]);

  const postLinks = useMemo<CommandLinkItem[]>(() => {
    return posts.map((post) => ({
      title: post.title,
      href: `/posts/${post.slug}`,
      icon: <BookOpenTextIcon />,
    }));
  }, [posts]);

  const socialLinks = useMemo<CommandLinkItem[]>(
    () => [
      { title: "GitHub", href: personalConfig.about.github, icon: <GitHubIcon />, openInNewTab: true },
      { title: "X", href: personalConfig.about.X, icon: <XIcon />, openInNewTab: true },
      { title: "Instagram", href: personalConfig.about.Instagram, icon: <InstagramIcon />, openInNewTab: true },
    ],
    [],
  );

  const onOpenLink = useCallback(
    (href: string, openInNewTab = false) => {
      setOpen(false);

      if (openInNewTab) {
        window.open(href, "_blank", "noopener");
        return;
      }

      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";

      if ((event.metaKey || event.ctrlKey) && isK) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-2 font-mono text-xs text-muted-foreground sm:inline-flex"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-3.5" />
        Search
        <CommandShortcut className="tracking-normal">Ctrl K</CommandShortcut>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Menu">
              {MENU_LINKS.map((item) => (
                <CommandItem key={item.title} onSelect={() => onOpenLink(item.href, item.openInNewTab)}>
                  {item.icon}
                  {item.title}
                  {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Sections">
              {SECTION_LINKS.map((item) => (
                <CommandItem key={item.title} onSelect={() => onOpenLink(item.href)}>
                  {item.icon}
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading={`Posts (${posts.length})`}>
              {isLoading ? (
                <CommandItem disabled>
                  <Loader2 className="size-4 animate-spin" />
                  Loading posts...
                </CommandItem>
              ) : (
                postLinks.map((item) => (
                  <CommandItem key={item.href} onSelect={() => onOpenLink(item.href)}>
                    {item.icon}
                    {item.title}
                  </CommandItem>
                ))
              )}
            </CommandGroup>

            <CommandGroup heading="Social Links">
              {socialLinks.map((item) => (
                <CommandItem key={item.title} onSelect={() => onOpenLink(item.href, item.openInNewTab)}>
                  {item.icon}
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

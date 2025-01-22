type SiteConfig = {
  name: string;
  description: string;
  url: string;
  siteUrl: string;
  siteLanguage: string;
  logo: string;
  ogImage: string;
  favicon: string;
  shortName: string;
  authors: { name: string; url: string }[];
  links: {
    github: string;
    X: string;
    portfolio: string;
  };
  keywords: string[];
};

export const siteConfig: SiteConfig = {
  name: "Arun Kumar's Blog",
  description:
    "Hi I'm Arun Kumar, and this is my blog. I'm passionate about sharing my knowledge and learning in Mathematics, Machine Learning, React, and sometimes other topics that inspire me",
  url: "https://www.blog.arun.space",
  siteUrl: "https://www.blog.arun.space/",
  siteLanguage: "en",
  logo: "assets/logo.png",
  ogImage: "",
  favicon: "app/favicon.ico",
  shortName: "Arun's Blog",
  authors: [
    {
      name: "Arun Kumar",
      url: "https://x.com/meArun_Kumar_",
    },
  ],
  links: {
    github: "https://github.com/Arun-Kumar21",
    X: "https://x.com/meArun_Kumar_",
    portfolio: "https://www.arun.space/",
  },
  keywords: [
    "Arun Kumar",
    "Arun's Blog",
    "Arun Kumar's Blog",
    "Blog",
    "Machine Learning",
    "React",
    "Mathematics",
    "Math",
    "ML",
    "AI",
    "Data Science",
    "Web Development",
    "Deep Learning",
    "Neural Networks",
  ],
};

import personalData from "@/data/personal.json";

type NavItem = {
  label: string;
  href: string;
};

type AboutData = {
  name: string;
  expertise: string[];
  github: string;
  X: string;
  Instagram: string;
  pronoun: string;
  email: string;
  location: string;
  timezone: string;
  description: string[];
};

type PersonalData = {
  siteName: string;
  copyrightName: string;
  avatar: string;
  navigation: NavItem[];
  about: AboutData;
  repo: string;
};

export const personalConfig: PersonalData = personalData;
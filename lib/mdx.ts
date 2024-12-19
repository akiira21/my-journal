import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remarkMeta } from "./remark-meta";
import { compileMDX } from "next-mdx-remote/rsc";

import { mdxComponents } from "./mdx-components";

// Get all the mdx files from content dir
function getMdxFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

// Read data from mdx files
function readMdxFile(filepath: fs.PathOrFileDescriptor) {
  const rawContent = fs.readFileSync(filepath, "utf-8");

  return matter(rawContent);
}

// Extract metadata and mdx data
function getMdxData(dir: string) {
  const mdxFiles = getMdxFiles(dir);

  return mdxFiles.map((file) => {
    const { data: metadata, content } = readMdxFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getBlogPosts() {
  return getMdxData(path.join(process.cwd(), "content"));
}

export async function getPostBySlug(slug: string) {
  const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [remarkMeta],
      },
    },

    //@ts-ignore
    components: {
      ...mdxComponents,
    },
  });

  const sections = extractMDXSections(content);

  return {
    metadata: data,
    content: mdxContent,
    readTime: calculateReadingTime(content),
    sections,
  };
}

export function getCategories() {
  const posts = getBlogPosts();

  const categories: string[] = [];

  posts.map((post) => {
    post.metadata.categories.forEach((category: string) => {
      if (categories.includes(category)) return;
      else categories.push(category);
    });
  });

  return categories;
}

export function getPostsByCategory(category: string) {
  const posts = getBlogPosts();

  return posts.filter((post) => post.metadata.categories.includes(category));
}

export function calculateReadingTime(content: string) {
  const wordsPerMinute = 100;
  const textLength = content.split(" ").length;

  return Math.ceil(textLength / wordsPerMinute);
}
export function extractMDXSections(content: string) {
  const patterns = {
    // Matches standard markdown headings (# Heading)
    markdownHeading: /^(#{1,6})\s+(.+)$/gm,

    // Matches JSX section components (<Section>)
    jsxSection: /<Section[^>]*>[\s\S]*?<\/Section>/g,

    // Matches HTML heading tags (<h1>-<h6>)
    htmlHeading: /<h[1-6][^>]*>(.*?)<\/h[1-6]>/g,

    // Matches custom heading components
    customHeading: /<Heading[^>]*>(.*?)<\/Heading>/g,
  };

  const sections = [];

  // Function to convert text to ID format
  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove consecutive hyphens
      .trim();
  };

  // Extract markdown headings
  let match;
  while ((match = patterns.markdownHeading.exec(content)) !== null) {
    const [, level, title] = match;
    sections.push({
      type: "markdown",
      level: level.length,
      title: title.trim(),
      id: generateId(title),
      position: match.index,
    });
  }

  // Extract JSX sections
  while ((match = patterns.jsxSection.exec(content)) !== null) {
    const section = match[0];
    // Extract id from section props
    const idMatch = section.match(/id=["']([^"']+)["']/);
    // Extract title from section props
    const titleMatch = section.match(/title=["']([^"']+)["']/);

    sections.push({
      type: "jsx",
      title: titleMatch ? titleMatch[1] : null,
      id: idMatch ? idMatch[1] : generateId(titleMatch ? titleMatch[1] : ""),
      position: match.index,
      rawContent: section,
    });
  }

  // Extract HTML headings
  while ((match = patterns.htmlHeading.exec(content)) !== null) {
    const title = match[1].replace(/<[^>]+>/g, "").trim(); // Remove any nested HTML tags
    sections.push({
      type: "html",
      title: title,
      id: generateId(title),
      position: match.index,
    });
  }

  // Extract custom heading components
  while ((match = patterns.customHeading.exec(content)) !== null) {
    const heading = match[0];
    const idMatch = heading.match(/id=["']([^"']+)["']/);
    const titleMatch = heading.match(/title=["']([^"']+)["']/);

    sections.push({
      type: "custom",
      title: titleMatch ? titleMatch[1] : match[1],
      id: idMatch
        ? idMatch[1]
        : generateId(titleMatch ? titleMatch[1] : match[1]),
      position: match.index,
    });
  }

  // Sort sections by their position in the document
  sections.sort((a, b) => a.position - b.position);

  return sections;
}

export function formatDate(
  date: string,
  includeRelative = false,
  isYearIncluded = false
) {
  const currentDate = new Date();

  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  const targetDate = new Date(date);

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}m ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  let fullDate = `${
    monthsMap[targetDate.getMonth()]
  } ${targetDate.getDate()}, ${targetDate.getFullYear()}`;

  if (!isYearIncluded) {
    fullDate = `${monthsMap[targetDate.getMonth()]} ${targetDate.getDate()}`;
  }

  if (!includeRelative) {
    return fullDate;
  }

  return `${formattedDate} (${fullDate})`;
}
const monthsMap: { [key: number]: string } = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

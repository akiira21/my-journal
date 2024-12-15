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
  let rawContent = fs.readFileSync(filepath, "utf-8");

  return matter(rawContent);
}

// Extract metadata and mdx data
function getMdxData(dir: string) {
  let mdxFiles = getMdxFiles(dir);

  return mdxFiles.map((file) => {
    let { data: metadata, content } = readMdxFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

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

  // Use compileMDX instead of serialize for RSC
  const { content: mdxContent } = await compileMDX({
    source: content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [remarkMeta],
      },
    },
    // @ts-ignore
    components: {
      ...mdxComponents,
    },
  });

  return {
    metadata: data,
    content: mdxContent,
    readTime: calculateReadingTime(content),
  };
}

export function calculateReadingTime(content: string) {
  let wordsPerMinute = 200;
  let textLength = content.split(" ").length;

  return Math.ceil(textLength / wordsPerMinute);
}

export function formatDate(
  date: string,
  includeRelative = false,
  isYearIncluded = false
) {
  let currentDate = new Date();

  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

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

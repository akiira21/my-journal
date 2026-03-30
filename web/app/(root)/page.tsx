import { TypographyH2, TypographyP } from "@/custom_components/typography";
import FeaturedPosts from "./_components/featured-posts";
import { getBlogPosts } from "@/lib/mdx";
import LatestPosts from "./_components/latest-posts";
import AsymmetricGaussianPlot from "./_components/gaussian-sketch";

export default function HomePage () {
	const posts = getBlogPosts();

	const featuredPosts = posts.filter(post => post.metadata.featured);
	const dsaPosts = posts.filter(posts => posts.metadata.isDsaBlog)

	const eulerPosts = posts.filter(post => post.metadata.tag === "Euler")

	const chessEngineBlogs = posts.filter(post => post.metadata.tag === "chess")

	return (
		<>
			<AsymmetricGaussianPlot />

			<div>
				<TypographyH2 className="italic">Arun Kumar&apos;s Journal</TypographyH2>
				<p className="italic mt-2">
					A journal of things I learn and build.
				</p>
				<p>
					It covers topics like math, computer science, and machine learning.
				</p>
			</div>


			<div className="max-w-xl mb-32">
				<div className="my-12">
					{featuredPosts.length > 0 && <FeaturedPosts featuredPosts={featuredPosts}/>}
				</div>

				<div className="my-12">
					<LatestPosts latestPosts={posts.splice(0, 3)}/>
				</div>

			</div>	
		</>
	)
}
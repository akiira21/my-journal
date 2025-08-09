import { BackwardAnchor } from "@/custom_components/anchor";
import { OrderedList } from "@/custom_components/list";
import { TypographyH2, TypographyH4, TypographyP } from "@/custom_components/typography";
import Link from "next/link";
import FibonacciSpiral from "../_components/fibo-sketch";

export default function AboutPage () {
    return (
        <div className="">
            <BackwardAnchor
                text="Home"
                href="/"
                className="text-xs text-neutral-600 dark:text-zinc-400"
            />

            <TypographyH2 className="italic my-4">About Me</TypographyH2>

            <div className="my-4">
                <TypographyP>
                    Hi, I&apos;m Arun Kumar. I&apos;m based in India and love building things — whether it&apos;s a website, a machine learning model, or some experimental project that sounds fun.
                </TypographyP>

                <TypographyP>
                    I&apos;m currently pursuing a degree in <span className="font-semibold italic">Artificial Intelligence and Machine Learning</span> at <Link href="https://www.ipu.ac.in/" target="_blank"><span className="font-semibold italic text-blue-500">University School of Automation and Robotics, GGSIPU</span></Link><span className="ml-2">[2022-2026]</span>
                </TypographyP>

                <TypographyH4 className="my-4">My expertise:</TypographyH4>

                <OrderedList items={["Full Stack - Next.js, Express.js, React.js, Node.js, MongoDB, PostgreSQL, Flask", "Machine Learning / Deep Learning - Python, NumPy, Pandas, Matplotlib, PyTorch"]}/>

                <TypographyH4 className="my-4">Hobbies & Interests:</TypographyH4>

                <OrderedList items={["Watching anime", "Playing PC games like Minecraft and story-driven games", "Chess", "Reading about AI and mathematics"]}/>


                <TypographyP className="my-4">You can check my projects at <Link href={"https://arun.space"} className="text-blue-500 italic font-semibold" target="_blank">arun.space</Link></TypographyP>


                <FibonacciSpiral />
            </div>
        </div>       
    )
}
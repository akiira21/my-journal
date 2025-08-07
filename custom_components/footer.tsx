"use client"

import Link from "next/link"
import Logo from "./logo"
import { GITHUB, PORTFOLIO, XPROFILE } from "@/personal-links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import axios, { isAxiosError } from 'axios';

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type NewsletterForm = z.infer<typeof newsletterSchema>

export default function Footer() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<NewsletterForm>({
        resolver: zodResolver(newsletterSchema),
    })

    const onSubmit = async (data: NewsletterForm) => {
        setIsSubmitting(true)
        setMessage("")
        setIsError(false)
        
        try {
            const res = await axios.post('/api/subscribe', {
               email: data.email 
            })

            if (res.data.success === true) {
                setMessage("Thank you for subscribing! ✨")
                setIsError(false)
                reset() 
            } else if (res.data.error) {
                setMessage(res.data.error)
                setIsError(true)
            } else {
                setMessage("Something went wrong. Please try again.")
                setIsError(true)
            }
        } catch (error) {
            if (isAxiosError(error) && error.response?.data?.error) {
                setMessage(error.response.data.error)
            } else {
                setMessage("Network error. Please try again.")
            }
            setIsError(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <footer className="border-t mt-16">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex flex-col items-center space-y-6">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Logo width={32} height={32}/>
                    </div>
                                        
                    {/* Tagline */}
                    <p className="text-gray-600 text-center text-sm italic max-w-md">
                        Thoughts, stories, and reflections from a wandering mind
                    </p>

                    {/* Newsletter Form */}
                    <div className="w-full max-w-sm">
                        {message.length > 0 ? (
                            <div className="text-center py-3">
                                <p className={`text-sm ${isError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{message}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 text-sm h-9 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                                        disabled={isSubmitting}
                                    />
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="h-9 px-4 text-sm bg-gray-800 hover:bg-gray-700 text-white"
                                    >
                                        {isSubmitting ? "..." : "Subscribe"}
                                    </Button>
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 text-center">{errors.email.message}</p>
                                )}
                                <p className="text-xs text-gray-400 text-center">
                                    Get notified when new stories are published
                                </p>
                            </form>
                        )}
                    </div>
                                        
                    {/* Social Links */}
                    <div className="flex items-center space-x-6">
                        <Link 
                            href={XPROFILE}
                            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Twitter
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            href={GITHUB}
                            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            href={PORTFOLIO}
                            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Portfolio
                        </Link>
                    </div>
                                        
                    {/* Copyright */}
                    <div className="text-center text-xs text-gray-400 pt-4 border-t w-full">
                        <p>© {new Date().getFullYear()} All rights reserved. Made with care and curiosity.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}


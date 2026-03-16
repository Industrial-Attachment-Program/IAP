"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Search, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


export default function NotFound() {
    const router = useRouter();

    return (
        <div className="h-screen w-screen bg-white flex items-center justify-center relative overflow-hidden font-sans selection:bg-primary/10">
            {/* Subtle Background Accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-linear-to-bl from-primary/5 to-transparent rounded-bl-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-linear-to-tr from-primary/5 to-transparent rounded-tr-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl w-full px-6 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center"
                >
                    {/* Clean 404 Indicator */}
                    <div className="mb-8 relative">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-[12rem] md:text-[16rem] font-black leading-none text-neutral-300 select-none tracking-tighter"
                        >
                            404
                        </motion.div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
                        Page Not Found
                    </h1>

                    <p className="text-lg text-neutral-500 mb-12 max-w-md mx-auto leading-relaxed">
                        We couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto rounded-xl h-14 px-8 text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                <Home className="mr-2 h-4 w-4" /> Go to Dashboard
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto rounded-xl h-14 px-8 text-sm font-semibold border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                    </div>

                    <div className="mt-24 text-neutral-300 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                        <span>IAP System</span>
                        <span className="h-1 w-1 rounded-full bg-neutral-200" />
                        <span>Error 404</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

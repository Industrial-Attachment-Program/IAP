"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    let role: "admin" | "supervisor" | "student" | "liaison" = "student";
    if (pathname.startsWith("/admin")) role = "admin";
    else if (pathname.startsWith("/supervisor")) role = "supervisor";
    else if (pathname.startsWith("/liaison")) role = "liaison";
    else if (pathname.startsWith("/student")) role = "student";

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(storedUser);
            const userRole = user.role?.toLowerCase();

            if (pathname.startsWith("/admin") && userRole !== "admin") {
                router.push("/login");
                return;
            }
            if (pathname.startsWith("/supervisor") && userRole !== "supervisor") {
                router.push("/login");
                return;
            }
            if (pathname.startsWith("/liaison") && userRole !== "liaison") {
                router.push("/login");
                return;
            }
            if (pathname.startsWith("/student") && userRole !== "student") {
                router.push("/login");
                return;
            }

            setUserId(user.id);
            setMounted(true);

            apiFetch('/auth/me').catch(() => {});

        } catch (e) {
            console.error("Auth hydration failed", e);
            router.push("/login");
        }
    }, [pathname, router]);

    if (!mounted) return <div className="min-h-screen bg-background" />;

    return (
        <div className="flex min-h-screen bg-background overflow-hidden w-full">
            <Sidebar role={role} userId={userId} />
            <div className="flex flex-col w-full pl-64 h-screen">
                <TopBar role={role} userId={userId} />
                <main className="pt-16 flex-1 overflow-y-auto w-full">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

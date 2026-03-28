"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Bell, Trash2, Clock, Loader2, CheckCircle2, AlertCircle, Info, FileText } from "lucide-react";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SecurityForm } from "@/components/settings/SecurityForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

const tabs = [
    { id: "profile", label: "Profile Information", icon: User, description: "Update your personal details and contact information" },
    { id: "security", label: "Security & Account", icon: Shield, description: "Manage your password and account security settings" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Configure how you receive alerts and updates" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary">Settings</h1>
                <p className="text-neutral mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    isActive 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1" 
                                        : "hover:bg-primary/5 text-neutral hover:text-primary"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-neutral group-hover:text-primary")} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="border-none shadow-xl shadow-neutral/5 overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardHeader className="pb-6 border-b border-neutral/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary/10">
                                            {(() => {
                                                const Icon = tabs.find(t => t.id === activeTab)?.icon || User;
                                                return <Icon className="h-6 w-6 text-primary" />;
                                            })()}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl text-primary">
                                                {tabs.find(t => t.id === activeTab)?.label}
                                            </CardTitle>
                                            <CardDescription>
                                                {tabs.find(t => t.id === activeTab)?.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    {activeTab === "profile" && <ProfileForm />}
                                    {activeTab === "security" && <SecurityForm />}
                                    
                                    {activeTab === "notifications" && (
                                        <NotificationsTabContent />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function NotificationsTabContent() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const result = await apiFetch(`/notifications`);
            if (result.ok) {
                setNotifications(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id?: number) => {
        try {
            if (id) {
                await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
                setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            } else {
                await Promise.all(
                    notifications
                        .filter(n => !n.read)
                        .map(n => apiFetch(`/notifications/${n.id}/read`, { method: "PATCH" }))
                );
                setNotifications(notifications.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const deleteNotification = async (id?: number) => {
        try {
            if (id) {
                await apiFetch(`/notifications/${id}`, { method: "DELETE" });
                setNotifications(notifications.filter(n => n.id !== id));
            } else {
                await apiFetch(`/notifications/clear`, { method: "DELETE" });
                setNotifications([]);
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "SUCCESS": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "ERROR": return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "WARNING": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case "TASK": return <FileText className="h-5 w-5 text-blue-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/20 mb-2" />
                <p className="text-sm text-neutral/60">Loading notifications...</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="py-12 text-center text-neutral space-y-4">
                <div className="bg-neutral/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-neutral/40" />
                </div>
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => markAsRead()} disabled={!notifications.some(n => !n.read)}>
                    Mark all as read
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteNotification()} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" /> Clear All
                </Button>
            </div>
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border transition-colors",
                            notif.read ? "bg-white border-neutral/5" : "bg-primary/5 border-primary/20"
                        )}
                    >
                        <div className="mt-1">{getIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4 mb-1">
                                <h4 className={cn("font-semibold text-primary truncate", !notif.read && "font-bold")}>
                                    {notif.title}
                                </h4>
                                <span className="text-[10px] text-neutral flex items-center gap-1 shrink-0">
                                    <Clock className="h-3 w-3" />
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-neutral mb-3">{notif.message}</p>
                            <div className="flex items-center gap-4">
                                {!notif.read && (
                                    <button onClick={() => markAsRead(notif.id)} className="text-xs font-semibold text-primary hover:underline">
                                        Mark as read
                                    </button>
                                )}
                                <button onClick={() => deleteNotification(notif.id)} className="text-xs font-semibold text-red-500 hover:underline">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

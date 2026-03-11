"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Student {
    id: number;
    name: string;
    supervisorId: number;
    user?: { id: number; name: string; email: string };
    phone?: string;
}

interface Task {
    id: number;
    status: string;
    studentId: number;
}

interface WeeklyLog {
    id: number;
    studentId: number;
    status: string;
}

export default function SupervisorRatingsListPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLog[]>([]);
    const [loading, setLoading] = useState(true);

    const params = useParams();
    const router = useRouter();
    const supervisorId = params.id ? Number(params.id) : undefined;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, tasksRes, logsRes] = await Promise.all([
                apiFetch(`/students?supervisorId=${supervisorId}`),
                apiFetch(`/tasks?supervisorId=${supervisorId}`),
                apiFetch(`/weekly-logs?supervisorId=${supervisorId}`)
            ]);

            if (studentsRes.ok) setStudents(studentsRes.data.students || []);
            if (tasksRes.ok) setTasks(tasksRes.data.tasks || []);
            if (logsRes.ok) setWeeklyLogs(logsRes.data.logs || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (supervisorId) fetchData();
    }, [supervisorId]);

    if (loading) return <div className="p-8 animate-pulse bg-white rounded-3xl h-96 shadow-sm" />;

    return (
        <div className="h-full flex flex-col space-y-8 pr-2 pb-10">
            {/* modern professional header */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Plus className="h-48 w-48 rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">
                        Student Assessment Vault
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
                        Welcome to the institutional performance command center. Here you can manage, assess, and review all student attachment records with professional precision. Monitor task progress and finalize industrial assessments.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-bold text-slate-500 italic">Assigned Students ({students.length})</h2>
                <div className="flex gap-2 text-[10px] font-bold text-slate-400 lowercase italic">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> excellent</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> on track</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> behind</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {students.map((student) => {
                    const studentTasks = tasks.filter((t) => t.studentId === student.id);
                    const totalTasks = studentTasks.length || 0;
                    const completed = studentTasks.filter((t) => t.status === "COMPLETED").length;
                    const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
                    const initials = student.user?.name
                        ? student.user.name.split(" ").map((n: any) => n[0]).join("")
                        : "st";
                    const status = progress >= 80 ? "excellent" : progress < 50 && totalTasks > 0 ? "behind" : "on track";

                    return (
                        <Card key={student.id} className="hover:border-primary/30 transition-all group cursor-pointer border-2 border-slate-50 shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="h-28 w-28 rounded-full border-4 border-slate-50 flex items-center justify-center relative shadow-inner bg-slate-50/50">
                                        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary/20" />
                                            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray={`${progress * 2.89} 289`} strokeLinecap="round" />
                                        </svg>
                                        <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-2xl font-black text-slate-900 shadow-sm">
                                            {initials}
                                        </div>
                                    </div>
                                    <span className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-md">
                                        <span className={cn("h-3 w-3 rounded-full", status === "excellent" ? "bg-green-500" : status === "behind" ? "bg-red-500" : "bg-yellow-500")} />
                                    </span>
                                </div>

                                <h3 className="font-black text-xl text-slate-900 mb-1 ">
                                    {student.user?.name || student.name}
                                </h3>

                                <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-4">
                                    <div className="text-left border-r border-slate-200 pr-4">
                                        <p className="text-[14px] font-semibold text-slate-400 mb-1">Task mastery</p>
                                        <p className="text-lg font-black text-slate-900">{progress}%</p>
                                        <p className="text-[12px] font-medium text-slate-400">{completed}/{totalTasks} done</p>
                                    </div>
                                    <div className="text-right pl-4">
                                        <p className="text-[14px] font-semibold text-slate-400 mb-1">Log status</p>
                                        <p className="text-lg font-black text-amber-600">{weeklyLogs.filter(l => l.studentId === student.id && l.status === 'SUBMITTED').length}</p>
                                        <p className="text-[12px] font-medium text-slate-400">pending review</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        className="text-[14px] font-bold h-12 cursor-pointer border-2 hover:bg-slate-900 hover:text-white transition-all border-slate-900 rounded-xl"
                                        onClick={() => router.push(`/supervisor/${supervisorId}/ratings/${student.id}`)}
                                    >
                                        Evaluate
                                    </Button>
                                    <Button
                                        className="text-[14px] font-bold h-12 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer rounded-xl"
                                        onClick={() => router.push(`/supervisor/${supervisorId}/logbook?studentId=${student.id}`)}
                                    >
                                        View logs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Check,
    Save,
    User,
    Building,
    Clock,
    ShieldCheck,
    Award,
    ClipboardCheck,
    Calendar,
    Loader2,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface RatingData {
    knowledgeWirelessOps: number;
    knowledgeWirelessEst: number;
    knowledgeWirelessMaint: number;
    knowledgeApplication: number;
    responsibility: number;
    cooperativeness: number;
    complianceEtiquette: number;
    safetyAwareness: number;
    safetyCompliance: number;
    safetyArrangement: number;
    absentDays: number;
    comment: string;
    evaluatorPosition: string;
    evaluatorName: string;
}

export default function StudentRatingPage() {
    const params = useParams();
    const router = useRouter();
    const supervisorId = params.id as string;
    const studentId = params.studentId as string;

    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [rating, setRating] = useState<RatingData>({
        knowledgeWirelessOps: 0,
        knowledgeWirelessEst: 0,
        knowledgeWirelessMaint: 0,
        knowledgeApplication: 0,
        responsibility: 0,
        cooperativeness: 0,
        complianceEtiquette: 0,
        safetyAwareness: 0,
        safetyCompliance: 0,
        safetyArrangement: 0,
        absentDays: 0,
        comment: "",
        evaluatorPosition: "",
        evaluatorName: ""
    });

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const result = await apiFetch(`/students/${studentId}`);
                if (result.ok) {
                    const studentData = result.data.student || result.data;
                    setStudent(studentData);
                    if (studentData.absentDays !== undefined && studentData.absentDays !== null) {
                        setRating(prev => ({ ...prev, absentDays: studentData.absentDays }));
                    }
                } else {
                    toast.error("Failed to load student data");
                }
            } catch (error) {
                console.error("Error fetching student:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [studentId]);

    const assignmentsScore = rating.knowledgeWirelessOps + rating.knowledgeWirelessEst + rating.knowledgeWirelessMaint + rating.knowledgeApplication;
    const attitudeScore = rating.responsibility + rating.cooperativeness + rating.complianceEtiquette;
    const safetyScore = rating.safetyAwareness + rating.safetyCompliance + rating.safetyArrangement;

    const rawScore = assignmentsScore + attitudeScore + safetyScore;
    const weightedScore = rawScore * 0.8;
    const attendanceRaw = Math.max(0, 100 - (rating.absentDays * 10));
    const attendanceWeighted = attendanceRaw * 0.2;
    const finalTotal = Math.round((weightedScore + attendanceWeighted) * 100) / 100;

    const handleSaveAssessment = async () => {
        setIsSaving(true);
        try {
            // 1. Update Student's absentDays
            await apiFetch(`/students/${studentId}`, {
                method: "PATCH",
                body: JSON.stringify({ absentDays: rating.absentDays })
            });

            // 2. Submit detailed rating
            await apiFetch("/ratings", {
                method: "POST",
                body: JSON.stringify({
                    studentId: Number(studentId),
                    supervisorId: Number(supervisorId),
                    rating: finalTotal,
                    comment: rating.comment,
                    knowledgeWirelessOps: rating.knowledgeWirelessOps,
                    knowledgeWirelessEst: rating.knowledgeWirelessEst,
                    knowledgeWirelessMaint: rating.knowledgeWirelessMaint,
                    knowledgeApplication: rating.knowledgeApplication,
                    responsibility: rating.responsibility,
                    cooperativeness: rating.cooperativeness,
                    complianceEtiquette: rating.complianceEtiquette,
                    safetyAwareness: rating.safetyAwareness,
                    safetyCompliance: rating.safetyCompliance,
                    safetyArrangement: rating.safetyArrangement,
                }),
            });

            toast.success("Assessment submitted successfully!");
            setTimeout(() => router.push(`/supervisor/${supervisorId}`), 1500);
        } catch (error) {
            console.error(error);
            toast.error("Submission failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-slate-500 font-bold">Initializing Assessment Vault...</p>
                </div>
            </div>
        );
    }

    const renderRatingGroup = (title: string, items: { id: string, label: string }[], currentGroup: string, colorClass: string, maxScore: number) => (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{title}</h3>
                <span className={`${colorClass} font-black text-xs px-2 py-1 rounded border border-current`}>Section Score: {
                    items.reduce((acc, item) => acc + (rating[item.id as keyof RatingData] as number), 0)
                } / {maxScore}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.map((item, index) => (
                    <div key={item.id} className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-primary/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <span className="text-slate-300 font-black text-xs">{index + 1}</span>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">{item.label}</label>
                            </div>
                            <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                                {rating[item.id as keyof RatingData] as number || 0} / 10
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-1">
                            {[10, 9, 8, 7, 6].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setRating(prev => ({ ...prev, [item.id]: val }))}
                                    className={`flex-1 h-10 rounded-xl border-2 font-black text-xs transition-all active:scale-95 ${rating[item.id as keyof RatingData] === val
                                        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                        : "border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600 bg-slate-50/50"
                                        }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 px-1 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                            <span>Very High</span>
                            <span>Very Low</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Toaster position="top-right" />

            {/* Header Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors group"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Final Attachment Assessment</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supervisor Portal • Institutional Record</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Live Preview Total</span>
                            <span className="text-xl font-black text-primary">{finalTotal} / 100</span>
                        </div>
                        <Button
                            onClick={handleSaveAssessment}
                            disabled={isSaving}
                            className="bg-slate-900 hover:bg-black text-white px-8 h-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 gap-2 border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Finalize Record
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">

                {/* Student Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <Card className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-none overflow-hidden bg-white">
                            <CardHeader className="bg-slate-900 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-black border border-white/20">
                                        {student?.user?.name?.[0]}
                                    </div>
                                    <div>
                                        <CardTitle className="text-white text-xl font-black uppercase tracking-tight">{student?.user?.name}</CardTitle>
                                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">ID: {student?.studentNumber || student?.id}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Building className="h-3 w-3" /> Industry Partner
                                    </span>
                                    <p className="font-bold text-slate-900">{student?.companyName || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Award className="h-3 w-3" /> Department / Class
                                    </span>
                                    <p className="font-bold text-slate-900">{student?.department || "Digital Communications"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Period
                                    </span>
                                    <p className="font-bold text-slate-900">202X ~ 202X</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Assessment Date
                                    </span>
                                    <p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assessment Tables */}
                        <div className="space-y-16 pt-8">
                            {renderRatingGroup(
                                "1. Assignments (40%)",
                                [
                                    { id: 'knowledgeWirelessOps', label: 'Knowledge of wireless communication operations' },
                                    { id: 'knowledgeWirelessEst', label: 'Knowledge of wireless installation & establishment' },
                                    { id: 'knowledgeWirelessMaint', label: 'Knowledge of wireless maintenance & troubleshooting' },
                                    { id: 'knowledgeApplication', label: 'Knowledge of application of tool & testing equipment' },
                                ],
                                "assignments",
                                "text-blue-600 bg-blue-50",
                                40
                            )}

                            {renderRatingGroup(
                                "2. Attitude (30%)",
                                [
                                    { id: 'responsibility', label: 'Responsibility' },
                                    { id: 'cooperativeness', label: 'Cooperativeness' },
                                    { id: 'complianceEtiquette', label: 'Compliance with industrial etiquette' },
                                ],
                                "attitude",
                                "text-amber-600 bg-amber-50",
                                30
                            )}

                            {renderRatingGroup(
                                "3. Safety Management (30%)",
                                [
                                    { id: 'safetyAwareness', label: 'Awareness of safety management' },
                                    { id: 'safetyCompliance', label: 'Compliance with safety rules' },
                                    { id: 'safetyArrangement', label: 'Arrangement of safety instruments' },
                                ],
                                "safety",
                                "text-emerald-600 bg-emerald-50",
                                30
                            )}
                        </div>
                    </div>

                    {/* Sidebar Info & Calculations */}
                    <div className="space-y-8">
                        <Card className="border-2 border-slate-900 rounded-none overflow-hidden sticky top-32">
                            <CardHeader className="bg-slate-50 border-b-2 border-slate-900 p-6">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-center">Marking Formula</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500 uppercase tracking-tighter">Raw Score (A+B+C)</span>
                                        <span className="font-black text-slate-900">{rawScore} / 100</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900" style={{ width: `${rawScore}%` }} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-slate-400">80% Weighting</span>
                                        <span className="text-sm font-black text-slate-600">{weightedScore} pts</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t-2 border-dashed border-slate-100">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500 uppercase tracking-tighter">Attendance Record</span>
                                        <span className="font-black text-slate-900">{attendanceRaw} / 100</span>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Days of Absence</label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                className="text-lg font-black h-12 border-2 border-slate-900 rounded-none"
                                                value={rating.absentDays}
                                                onChange={(e) => setRating(prev => ({ ...prev, absentDays: Number(e.target.value) }))}
                                            />
                                            <p className="text-[9px] text-slate-400 leading-tight font-medium italic">-10 points per unauthorised absence.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-slate-400">20% Weighting</span>
                                        <span className="text-sm font-black text-slate-600">{attendanceWeighted} pts</span>
                                    </div>
                                </div>

                                <div className="bg-primary p-6 rounded-none text-white space-y-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mt-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 text-center">Institutional Grade</p>
                                    <div className="text-center">
                                        <p className="text-5xl font-black tracking-tighter">{finalTotal}</p>
                                        <p className="text-[10px] font-bold uppercase mt-2 text-white/70 tracking-widest">Final Weighted Marks</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/20 flex flex-col items-center">
                                        <span className="text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">Performance Category</span>
                                        <span className="text-xs font-black bg-white/20 px-3 py-1 rounded">
                                            {finalTotal >= 80 ? "EXCELLENT (A)" : finalTotal >= 60 ? "SATISFACTORY (B/C)" : "NEEDS IMPROVEMENT"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-6 bg-slate-900 rounded-none text-white/50 text-[9px] leading-relaxed font-bold uppercase tracking-widest">
                            Notice: This digital record constitutes a formal academic submission. By clicking finalize, the supervisor verifies all scores are accurate reflections of student progress during the attachment period.
                        </div>
                    </div>
                </div>

                {/* Evaluation Details & Signatures Area */}
                <div className="space-y-12 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-primary" /> Overall Professional Review
                            </label>
                            <textarea
                                placeholder="Provide a formal evaluation of the student's internship performance, notable strengths, and areas for professional growth..."
                                className="w-full h-44 rounded-none border-2 border-slate-900 p-6 text-sm focus:ring-0 focus:border-primary bg-white shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] outline-none resize-none transition-all"
                                value={rating.comment}
                                onChange={(e) => setRating(prev => ({ ...prev, comment: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-8 bg-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3 italic">Attestation Details</h4>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evaluator Position</label>
                                        <Input
                                            placeholder="e.g. Senior Network Engineer"
                                            className="h-12 rounded-none border-x-0 border-t-0 border-b border-slate-200 focus:border-primary px-0 font-bold"
                                            value={rating.evaluatorPosition}
                                            onChange={(e) => setRating(prev => ({ ...prev, evaluatorPosition: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                        <Input
                                            placeholder="Enter your full name"
                                            className="h-12 rounded-none border-x-0 border-t-0 border-b border-slate-200 focus:border-primary px-0 font-bold"
                                            value={rating.evaluatorName}
                                            onChange={(e) => setRating(prev => ({ ...prev, evaluatorName: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between items-end">
                                    <div className="space-y-2">
                                        <div className="h-12 w-48 border-b-2 border-slate-900 flex items-end pb-2">
                                            <span className="text-slate-200 font-bold italic text-xs">Digital Signature Active</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supervisor Signature</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Stamp</p>
                                        <div className="h-16 w-16 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center text-[8px] font-black text-slate-200 uppercase mt-2">
                                            Institutional
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

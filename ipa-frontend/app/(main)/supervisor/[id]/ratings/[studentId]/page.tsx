"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

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
                    // Force default 0 for absentDays if not set
                    setRating(prev => ({
                        ...prev,
                        absentDays: (studentData.absentDays !== undefined && studentData.absentDays !== null) ? studentData.absentDays : 0
                    }));
                } else {
                    toast.error("failed to load student data");
                }
            } catch (error) {
                console.error("error fetching student:", error);
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
    const weightedPerformance = rawScore * 0.8;

    const attendanceRaw = Math.max(0, 100 - (rating.absentDays * 10));
    const attendanceWeighted = attendanceRaw * 0.2;

    const finalTotal = Math.round((weightedPerformance + attendanceWeighted) * 10) / 10;

    const handleSaveAssessment = async () => {
        setIsSaving(true);
        try {
            await apiFetch(`/students/${studentId}`, {
                method: "PATCH",
                body: JSON.stringify({ absentDays: rating.absentDays })
            });

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

            toast.success("assessment submitted successfully");
            setTimeout(() => router.push(`/supervisor/${supervisorId}/ratings`), 1500);
        } catch (error) {
            console.error(error);
            toast.error("submission failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
                    <p className="text-slate-400 font-medium">Loading assessment form...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans selection:bg-slate-200 selection:text-slate-900">
            <Toaster position="top-right" />

            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors group cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Industrial attachment assessment (for companies)</h1>
                            <p className="text-[11px] text-slate-400">supervisor portal • institutional assessment record</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSaveAssessment}
                        disabled={isSaving}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 h-10 rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />}
                        finalize assessment
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* student details header */}
                <div className="bg-white border-2 border-slate-900 p-0 overflow-hidden">
                    {/* header */}
                    <div className="border-b-2 border-slate-900 p-6 flex flex-col items-center justify-center space-y-4">
                        <h1 className="text-xl font-black text-center uppercase tracking-tight">Industrial Attachment Assessment (for Companies)</h1>
                        <div className="w-full space-y-4 pt-4 px-4">
                            <div className="flex gap-2 items-end">
                                <span className="text-sm font-bold whitespace-nowrap">Student name:</span>
                                <div className="flex-1 border-b border-black border-dotted h-5 text-sm uppercase px-2">{student?.user?.name || "................................................................................................................................................"}</div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <span className="text-sm font-bold whitespace-nowrap">Department/Class:</span>
                                <div className="flex-1 border-b border-black border-dotted h-5 text-sm uppercase px-2">{student?.studentProfile?.department || "................................................................................................................................................"}</div>
                            </div>
                        </div>
                    </div>

                    {/* marking scheme title */}
                    <div className="bg-slate-50 border-b-2 border-slate-900 py-3 text-center">
                        <span className="text-sm font-black uppercase tracking-widest">Marking Scheme</span>
                    </div>

                    {/* main table */}
                    <div className="relative overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="border-r border-slate-400 p-2 font-black uppercase [writing-mode:vertical-rl] rotate-180 py-4 h-32">Evaluation area</th>
                                    <th className="border-r border-slate-400 p-1 font-black w-8"></th>
                                    <th className="border-r border-slate-400 p-2 font-black uppercase text-center w-48">Evaluation item</th>
                                    <th className="border-r border-slate-400 p-2 font-black uppercase text-center w-16">Very High</th>
                                    <th className="border-r border-slate-400 p-2 font-black uppercase text-center w-16">High</th>
                                    <th className="border-r border-slate-400 p-2 font-black uppercase text-center w-16">Average</th>
                                    <th className="border-r border-slate-400 p-2 font-black uppercase text-center w-16">Low</th>
                                    <th className="border-r border-slate-400 p-2 font-black uppercase text-center w-16">Very Low</th>
                                    <th className="border-r border-slate-400 p-2 font-black uppercase text-center w-16">Score</th>
                                    <th className="p-4 text-[10px] w-48 align-top leading-relaxed italic bg-slate-50 font-medium">
                                        * Mark the score for each evaluation item and add up the total score and record it in the score column.
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Assignments Area */}
                                {[
                                    { id: 'knowledgeWirelessOps', label: 'Related knowledge', index: 1 },
                                    { id: 'knowledgeWirelessEst', label: 'Support for operation of wireless communication network', index: 2 },
                                    { id: 'knowledgeWirelessMaint', label: 'Establishment of wireless communication network', index: 3 },
                                    { id: 'knowledgeApplication', label: 'Maintenance of wireless communication room', index: 4 },
                                ].map((item, i) => (
                                    <tr key={item.id} className="border-b border-slate-300">
                                        {i === 0 && (
                                            <td rowSpan={4} className="border-r-2 border-slate-900 p-2 font-black uppercase [writing-mode:vertical-rl] rotate-180 text-center w-12 tracking-widest bg-slate-50">
                                                Assignments
                                            </td>
                                        )}
                                        <td className="border-r border-slate-300 p-2 text-center font-bold">{item.index}</td>
                                        <td className="border-r border-slate-300 p-3 leading-tight">{item.label}</td>
                                        {[10, 9, 8, 7, 6].map(val => (
                                            <td key={val} className="border-r border-slate-300 p-2 text-center">
                                                <div
                                                    onClick={() => setRating(prev => ({ ...prev, [item.id]: val }))}
                                                    className={cn(
                                                        "h-8 w-8 mx-auto flex items-center justify-center rounded-lg cursor-pointer transition-all border-2",
                                                        rating[item.id as keyof RatingData] === val
                                                            ? "bg-slate-900 text-white border-slate-900 scale-110 shadow-md"
                                                            : "border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600 font-bold"
                                                    )}
                                                >
                                                    {val}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="border-r-2 border-slate-900 p-2 text-center font-black bg-slate-50">
                                            {i === 0 ? `/40` : ""}
                                        </td>
                                        {i === 0 && (
                                            <td rowSpan={4} className="p-4 align-middle bg-white">
                                                <div className="h-20 w-full border-4 border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">sum</span>
                                                    <span className="text-2xl font-black text-slate-900">{assignmentsScore}</span>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}

                                {/* Attitude Area */}
                                {[
                                    { id: 'responsibility', label: 'Responsibility', index: 1 },
                                    { id: 'cooperativeness', label: 'Cooperativeness', index: 2 },
                                    { id: 'complianceEtiquette', label: 'Compliance with company rules and workplace etiquette', index: 3 },
                                ].map((item, i) => (
                                    <tr key={item.id} className="border-b border-slate-300">
                                        {i === 0 && (
                                            <td rowSpan={3} className="border-r-2 border-slate-900 p-2 font-black uppercase [writing-mode:vertical-rl] rotate-180 text-center w-12 tracking-widest bg-slate-50">
                                                Attitude
                                            </td>
                                        )}
                                        <td className="border-r border-slate-300 p-2 text-center font-bold">{item.index}</td>
                                        <td className="border-r border-slate-300 p-3 leading-tight">{item.label}</td>
                                        {[10, 9, 8, 7, 6].map(val => (
                                            <td key={val} className="border-r border-slate-300 p-2 text-center">
                                                <div
                                                    onClick={() => setRating(prev => ({ ...prev, [item.id]: val }))}
                                                    className={cn(
                                                        "h-8 w-8 mx-auto flex items-center justify-center rounded-lg cursor-pointer transition-all border-2",
                                                        rating[item.id as keyof RatingData] === val
                                                            ? "bg-slate-900 text-white border-slate-900 scale-110 shadow-md"
                                                            : "border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600 font-bold"
                                                    )}
                                                >
                                                    {val}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="border-r-2 border-slate-900 p-2 text-center font-black bg-slate-50">
                                            {i === 0 ? `/30` : ""}
                                        </td>
                                        {i === 0 && (
                                            <td rowSpan={3} className="p-4 align-middle bg-white">
                                                <div className="h-20 w-full border-4 border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">sum</span>
                                                    <span className="text-2xl font-black text-slate-900">{attitudeScore}</span>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}

                                {/* Safety Area */}
                                {[
                                    { id: 'safetyAwareness', label: 'Awareness of safety management', index: 1 },
                                    { id: 'safetyCompliance', label: 'Compliance with safety rules', index: 2 },
                                    { id: 'safetyArrangement', label: 'Arrangement of safety instruments', index: 3 },
                                ].map((item, i) => (
                                    <tr key={item.id} className="border-b border-slate-300">
                                        {i === 0 && (
                                            <td rowSpan={3} className="border-r-2 border-slate-900 p-2 font-black uppercase [writing-mode:vertical-rl] rotate-180 text-center w-12 tracking-widest bg-slate-50">
                                                Safety Management
                                            </td>
                                        )}
                                        <td className="border-r border-slate-300 p-2 text-center font-bold">{item.index}</td>
                                        <td className="border-r border-slate-300 p-3 leading-tight">{item.label}</td>
                                        {[10, 9, 8, 7, 6].map(val => (
                                            <td key={val} className="border-r border-slate-300 p-2 text-center">
                                                <div
                                                    onClick={() => setRating(prev => ({ ...prev, [item.id]: val }))}
                                                    className={cn(
                                                        "h-8 w-8 mx-auto flex items-center justify-center rounded-lg cursor-pointer transition-all border-2",
                                                        rating[item.id as keyof RatingData] === val
                                                            ? "bg-slate-900 text-white border-slate-900 scale-110 shadow-md"
                                                            : "border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600 font-bold"
                                                    )}
                                                >
                                                    {val}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="border-r-2 border-slate-900 p-2 text-center font-black bg-slate-50">
                                            {i === 0 ? `/30` : ""}
                                        </td>
                                        {i === 0 && (
                                            <td rowSpan={3} className="p-4 align-middle bg-slate-50 border-l-4 border-slate-900">
                                                <div className="text-center space-y-2">
                                                    <span className="text-[10px] font-black uppercase block">Total Score</span>
                                                    <div className="text-4xl font-black text-slate-900">{assignmentsScore + attitudeScore + safetyScore}/100</div>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}

                                {/* Attendance Block */}
                                <tr className="border-b-2 border-slate-900">
                                    <td className="border-r-2 border-slate-900 p-2 font-black uppercase [writing-mode:vertical-rl] rotate-180 text-center w-12 tracking-widest bg-slate-900 text-white">
                                        Attendance
                                    </td>
                                    <td colSpan={7} className="p-8 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black whitespace-nowrap uppercase">Days of Absence:</span>
                                            <input
                                                type="number"
                                                className="w-24 border-b-2 border-black border-dotted focus:outline-none text-center font-black text-lg h-10"
                                                value={rating.absentDays}
                                                onChange={(e) => setRating(prev => ({ ...prev, absentDays: Math.max(0, parseInt(e.target.value) || 0) }))}
                                            />
                                            <span className="text-[10px] font-bold text-slate-400 italic leading-tight">
                                                * 10 points are deducted for each absence from work per day. However, points will not be deducted for sick leave with supporting documents attached.
                                                <br />
                                                * Unauthorised late arrival, early departure without notice, 3 times of unauthorised results are treated as 1 day of absence from work
                                            </span>
                                        </div>
                                    </td>
                                    <td className="border-r-2 border-slate-900 p-2 text-center font-black bg-slate-100">
                                        {attendanceRaw}/100
                                    </td>
                                    <td className="p-4 align-middle bg-slate-900 text-white">
                                        <div className="text-center space-y-1">
                                            <span className="text-[10px] font-black uppercase block opacity-60">Final weighted</span>
                                            <div className="text-5xl font-black tracking-tighter">{finalTotal}</div>
                                            <span className="text-[10px] font-bold opacity-60">/ 100</span>
                                        </div>
                                    </td>
                                </tr>

                                {/* Marking Formula Row */}
                                <tr className="bg-slate-50">
                                    <td className="border-r-2 border-slate-900 p-3 font-black text-center text-[10px] uppercase">Marking</td>
                                    <td colSpan={9} className="p-4 text-xs font-black text-center tracking-wide">
                                        (Doing Training assignments + Attitude + Safety management) score × 80% + Attendance (20%)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* student attendance sheet footer */}
                <div className="bg-white border-2 border-slate-900 mt-8 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-black">
                        <span className="text-sm font-black uppercase tracking-widest pl-2">Student attendance sheet</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-900">
                        <div className="border-r border-slate-900 p-6 flex items-center justify-center bg-slate-50">
                            <span className="text-sm font-black uppercase">Scheme</span>
                        </div>
                        <div className="col-span-3 p-8 flex items-center justify-center gap-12">
                            <div className="flex items-center gap-4 text-lg">
                                <span className="font-black italic">score × 20% =</span>
                                <div className="border-b-2 border-black border-dotted w-16 text-center font-black">{attendanceWeighted}</div>
                                <span className="font-black">/ 100</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 border-b border-slate-900 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm font-bold">
                            <span>Period</span>
                            <div className="border-b border-black border-dotted w-12 text-center text-slate-400">dd.</div>
                            <span>mm.</span>
                            <div className="border-b border-black border-dotted w-12 text-center text-slate-400">202X</div>
                            <span>~</span>
                            <div className="border-b border-black border-dotted w-12 text-center text-slate-400">dd.</div>
                            <span>mm.</span>
                            <div className="border-b border-black border-dotted w-12 text-center text-slate-400">202X</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-900 h-40">
                        <div className="border-r border-slate-900 p-6 flex items-center justify-center bg-slate-50 text-center">
                            <span className="text-sm font-black uppercase">Overall<br />Review</span>
                        </div>
                        <div className="col-span-3 p-0">
                            <textarea
                                className="w-full h-full p-6 text-sm italic resize-none focus:outline-none placeholder:text-slate-200"
                                placeholder="Write overall student performance review here..."
                                value={rating.comment}
                                onChange={(e) => setRating(prev => ({ ...prev, comment: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="p-10 space-y-8 bg-slate-50">
                        <div className="flex gap-4 items-end">
                            <span className="text-sm font-bold uppercase w-48">Company Name:</span>
                            <div className="flex-1 border-b-2 border-black border-dotted h-6 uppercase font-black px-4">{student?.companyName || "................................................................................................................................"}</div>
                        </div>
                        <div className="flex gap-4 items-end">
                            <span className="text-sm font-bold uppercase w-48">Evaluator's Position:</span>
                            <Input
                                className="flex-1 bg-transparent border-b-2 border-black border-dotted rounded-none shadow-none h-6 p-0 text-sm font-black uppercase focus-visible:ring-0"
                                value={rating.evaluatorPosition}
                                onChange={(e) => setRating(prev => ({ ...prev, evaluatorPosition: e.target.value }))}
                                placeholder="................................................................................................................................"
                            />
                        </div>
                        <div className="flex gap-4 items-end relative">
                            <span className="text-sm font-bold uppercase w-48">Name:</span>
                            <Input
                                className="flex-1 bg-transparent border-b-2 border-black border-dotted rounded-none shadow-none h-6 p-0 text-sm font-black uppercase focus-visible:ring-0"
                                value={rating.evaluatorName}
                                onChange={(e) => setRating(prev => ({ ...prev, evaluatorName: e.target.value }))}
                                placeholder="................................................................................................................................"
                            />
                            <span className="absolute right-0 bottom-1 text-[10px] font-bold italic opacity-40">(signature)</span>
                        </div>
                    </div>
                </div>

                <div className="py-12 border-t-2 border-slate-900 mt-12 text-center text-slate-400 italic text-[11px] max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
                    this verification form is a formal academic record. by finalizing this assessment, the company supervisor confirms the accuracy of the student attendance and technical performance evaluation during the placement period.
                </div>
            </div>
        </div>
    );
}

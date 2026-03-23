"use client";

import React, { useState } from 'react';
import notificationService from '@/lib/api/notification';

export default function NotificationManagementPage() {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [duration, setDuration] = useState(8);
    const [gifName, setGifName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ text: string, error: boolean } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim()) {
            setStatus({ text: 'Message cannot be empty', error: true });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        try {
            await notificationService.send({
                message: message.trim(),
                type,
                duration: duration * 1000, // Convert to ms
                gifName: gifName || undefined
            });
            setStatus({ text: 'Notification broadcasted successfully!', error: false });
            setMessage('');
        } catch (error: any) {
            console.error('Broadcast error:', error);
            setStatus({ text: 'Failed to broadcast notification', error: true });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kiosk Broadcasting</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Send real-time alerts and messages directly to the public kiosk terminal.
                </p>
            </div>

            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-8 border border-slate-100">
                <form onSubmit={handleSend} className="space-y-8">
                    
                    {/* Message Input */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Broadcast Message
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg p-4 bg-slate-50 transition-colors"
                                placeholder="Type the message to display on the kiosk..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                minLength={1}
                                maxLength={200}
                                required
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-400 text-right">
                            {message.length} / 200 characters
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Type Selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Alert Type
                            </label>
                            <div className="flex flex-col space-y-2 mt-2">
                                {(['info', 'success', 'warning', 'error'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                            type === t 
                                                ? t === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' :
                                                  t === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' :
                                                  t === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' :
                                                  'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-8">
                            {/* Duration Selection */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Display Duration (Seconds)
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    min="3"
                                    max="60"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-slate-50"
                                />
                            </div>

                            {/* GIF Selection */}
                            <div>
                                <label htmlFor="gif" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Include Animated GIF
                                </label>
                                <select
                                    id="gif"
                                    value={gifName}
                                    onChange={(e) => setGifName(e.target.value)}
                                    className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-slate-50"
                                >
                                    <option value="">No GIF (Text Only)</option>
                                    <option value="shocked.gif">Shocked (Standard)</option>
                                    <option value="shocked-gif-1.gif">Shocked Alternative 1</option>
                                    <option value="shocked-gif-2.gif">Shocked Alternative 2</option>
                                </select>
                                <p className="mt-2 text-xs text-slate-500">
                                    Attaches an animated reaction GIF to the right side of the notification on the kiosk.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${
                            status.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                            {status.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Broadcasting...
                                </>
                            ) : (
                                'Send Broadcast'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

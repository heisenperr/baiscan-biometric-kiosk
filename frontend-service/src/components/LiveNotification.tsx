"use client";

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/api';

interface NotificationPayload {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration: number;
    gifName?: string;
    timestamp: string;
}

export default function LiveNotification() {
    const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

    useEffect(() => {
        // Initialize socket connection
        const socket: Socket = io(SOCKET_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
        });

        socket.on('connect', () => {
            console.log('[LiveNotification] Connected to WebSocket server');
        });

        socket.on('notification', (payload: NotificationPayload) => {
            console.log('[LiveNotification] Received broadcast:', payload);

            setNotifications((prev) => [...prev, payload]);

            // Auto-remove notification after its duration
            setTimeout(() => {
                setNotifications((prev) => prev.filter(n => n.id !== payload.id));
            }, payload.duration);
        });

        socket.on('disconnect', () => {
            console.log('[LiveNotification] Disconnected from WebSocket server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center space-y-2 pointer-events-none w-[90%] max-w-lg">
            {notifications.map((notif) => {
                const isInfo = notif.type === 'info';
                const isSuccess = notif.type === 'success';
                const isWarning = notif.type === 'warning';
                const isError = notif.type === 'error';

                return (
                    <div
                        key={notif.id}
                        className={`flex items-center w-full px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-top-2 fade-in duration-500
                        ${isInfo ? 'bg-blue-900/80 border-blue-500/50 text-blue-50 shadow-blue-500/20' : ''}
                        ${isSuccess ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-50 shadow-emerald-500/20' : ''}
                        ${isWarning ? 'bg-amber-900/80 border-amber-500/50 text-amber-50 shadow-amber-500/20' : ''}
                        ${isError ? 'bg-rose-900/80 border-rose-500/50 text-rose-50 shadow-rose-500/20' : ''}
                        `}
                    >
                        <div className="flex-shrink-0 mr-3">
                            {isInfo && (
                                <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-300">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            )}
                            {isSuccess && (
                                <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-300">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            )}
                            {isWarning && (
                                <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            )}
                            {isError && (
                                <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-300">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pr-3">
                            <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-0.5 leading-none">
                                {isInfo ? 'System Broadcast' : isSuccess ? 'Success' : isWarning ? 'Warning' : 'Critical Alert'}
                            </p>
                            <p className="text-xs sm:text-sm font-medium leading-snug shadow-sm drop-shadow-md">
                                {notif.message}
                            </p>
                        </div>
                        {notif.gifName && (
                            <div className="flex-shrink-0 ml-2 border-l border-white/20 pl-3 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/gif/${notif.gifName}`}
                                    alt="Reaction"
                                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-md drop-shadow-lg animate-in zoom-in duration-500"
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

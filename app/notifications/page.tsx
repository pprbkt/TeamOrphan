"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { formatTimeAgo } from "@/lib/utils";
import { Bell, Check, Clock, UserPlus, Inbox, AlertTriangle } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "JOIN_REQUEST":
        return <UserPlus className="w-5 h-5 text-brutal-pink" />;
      case "REQUEST_ACCEPTED":
        return <Check className="w-5 h-5 text-green-600 stroke-[3]" />;
      case "URGENCY_WARNING":
        return <Clock className="w-5 h-5 text-red-600 animate-spin" />;
      default:
        return <Bell className="w-5 h-5 text-black" />;
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-brutal-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="border-3 border-black bg-brutal-yellow p-2 shadow-brutal-sm">
              <Bell className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-4xl font-black uppercase text-black">
                NOTIFICATIONS
              </h1>
              <p className="text-xs font-bold text-neutral-600">
                Live updates for requests, acceptances, and event cutoff deadlines.
              </p>
            </div>
          </div>

          <BrutalButton
            variant="white"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.read)}
          >
            Mark All Read
          </BrutalButton>
        </div>
      </div>

      {loading ? (
        <p className="text-xs font-bold text-neutral-500 text-center py-10">
          Loading notifications...
        </p>
      ) : notifications.length === 0 ? (
        <BrutalCard variant="muted" shadowSize="sm" className="py-12 text-center space-y-3">
          <Inbox className="w-10 h-10 mx-auto text-neutral-500" />
          <h3 className="font-heading text-lg font-black uppercase text-black">
            NO NOTIFICATIONS
          </h3>
          <p className="text-xs font-bold text-neutral-600">
            You&apos;re completely up to date.
          </p>
        </BrutalCard>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <BrutalCard
              key={n.id}
              variant={n.read ? "white" : "yellow"}
              shadowSize="sm"
              className="flex items-start justify-between gap-4 p-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000] shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="font-heading text-sm font-black uppercase text-black">
                    {n.title}
                  </div>
                  <p className="text-xs font-semibold text-neutral-800">
                    {n.message}
                  </p>
                  <span className="text-[10px] font-bold text-neutral-500 block">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
              </div>

              {n.link && (
                <Link href={n.link} className="shrink-0 self-center">
                  <BrutalButton variant="black" size="sm">
                    View →
                  </BrutalButton>
                </Link>
              )}
            </BrutalCard>
          ))}
        </div>
      )}
    </div>
  );
}

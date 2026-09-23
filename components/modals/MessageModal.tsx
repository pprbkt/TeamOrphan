"use client";

import React, { useState } from "react";
import { BrutalModal } from "../ui/BrutalModal";
import { BrutalButton } from "../ui/BrutalButton";
import { BrutalTextarea } from "../ui/BrutalInput";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";

export interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  receiverId,
  receiverName,
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setContent("");
        onClose();
        router.push(`/messages?chatWith=${receiverId}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalModal isOpen={isOpen} onClose={onClose} title={`Message ${receiverName}`}>
      {success ? (
        <div className="py-6 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border-3 border-black bg-brutal-green shadow-brutal">
            <CheckCircle2 className="w-8 h-8 text-black stroke-[3]" />
          </div>
          <h4 className="font-heading text-lg font-black uppercase text-black">
            Message Sent!
          </h4>
          <p className="text-xs font-semibold text-neutral-600">
            Redirecting to your conversation...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs font-black text-red-600 border-2 border-black bg-red-100 p-2 uppercase">
              {error}
            </p>
          )}

          <BrutalTextarea
            label={`Direct message to ${receiverName}`}
            placeholder="Write your message here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </BrutalButton>
            <BrutalButton
              type="submit"
              variant="yellow"
              size="sm"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
              {loading ? "Sending..." : "Send Message"}
            </BrutalButton>
          </div>
        </form>
      )}
    </BrutalModal>
  );
};

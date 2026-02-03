'use client';

import { useEffect, useRef } from 'react';

interface MessageLogProps {
  messages: string[];
}

export default function MessageLog({ messages }: MessageLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-32 bg-gray-900 border-t border-gray-700 overflow-y-auto p-2">
      <div className="text-xs text-gray-400 space-y-1">
        {messages.length === 0 ? (
          <p className="text-gray-600">No messages yet...</p>
        ) : (
          messages.map((msg, i) => (
            <p key={i} className="text-gray-300">
              {msg}
            </p>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

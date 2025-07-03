"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { pusherClient } from "@/lib/pusher-client";
import { useSession } from "next-auth/react";

type ChatMessage = { user: string; message: string; timestamp: string };

export default function ChatBox({ itemId }: { itemId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const { data: session } = useSession();
  useEffect(() => {
    const channel = pusherClient.subscribe(`chat-${itemId}`);

    channel.bind("new-message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [itemId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userName = session?.user?.name || session?.user?.email || "Anon";

    await fetch("/api/pusher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: `chat-${itemId}`,
        event: "new-message",
        data: {
          user: userName,
          message: input.trim(),
          timestamp: new Date().toISOString(),
        },
      }),
    });

    setInput("");
  };

  return (
    <div className="pt-4">
      <div className="h-104 overflow-y-auto bg-white p-3 rounded-md text-sm">
        {[...messages].reverse().map((msg, idx) => (
          <div key={idx} className="mb-2">
            <div>
              <span className="font-semibold">{msg.user}:</span>{" "}
              <span>{msg.message}</span>
            </div>
            <div className="text-xs text-gray-500 ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex place-items-center gap-2 mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="bg-white p-2 flex-1 rounded-md"
        />
        <Button onClick={sendMessage} disabled={!session}>
          Enviar
        </Button>
      </div>

      {!session && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Inicia sesión para participar en el chat
        </div>
      )}
    </div>
  );
}

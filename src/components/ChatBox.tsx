"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Button } from "@/components/ui/button";

type ChatMessage = { user: string; message: string; timestamp: string };

export default function ChatBox({ itemId }: { itemId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "sa1",
    });

    const channel = pusher.subscribe(`chat-${itemId}`);
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

    await fetch("/api/pusher", {
      method: "POST",
      body: JSON.stringify({ message: input, itemId }),
      headers: { "Content-Type": "application/json" },
    });

    setInput("");
  };

  return (
    <div className="mt-6 pt-4">
      <h3 className="font-bold mb-2">Live Chat</h3>

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
        <Button onClick={sendMessage}>Enviar</Button>
      </div>
    </div>
  );
}

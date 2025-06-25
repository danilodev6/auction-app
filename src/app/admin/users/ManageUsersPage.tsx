"use client";

import { useState } from "react";
import { getUsersByName } from "./actions"; // server action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/db/schema";

export default function ManageUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const res = await getUsersByName(query); // server action
    setUsers(res);
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-between items-center">
      <div className="flex lg:w-120 justify-center items-center gap-2 mb-4">
        <Input
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      {users.length > 0 && (
        <div className="space-y-2 lg:w-120">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-2 rounded-md bg-white flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>{user.name}</strong> ({user.email})
                </p>
                <p>
                  Phone: {user.phone || "N/A"} | Role: {user.role}
                </p>
              </div>

              <form action="/api/users/block" method="POST">
                <input type="hidden" name="userId" value={user.id} />
                <input
                  type="hidden"
                  name="block"
                  value={user.role !== "blocked" ? "true" : "false"}
                />
                <Button
                  type="submit"
                  variant={user.role === "blocked" ? "default" : "destructive"}
                >
                  {user.role === "blocked" ? "Unblock" : "Block"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

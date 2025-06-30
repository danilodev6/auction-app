"use client";

import { useState } from "react";
import { getUsersByName, toggleUserRole, updateUserRole } from "./actions"; // server action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/db/schema";
import DeleteUserButton from "./DeleteUserButton";

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
          placeholder="Buscar por Nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          Buscar
        </Button>
      </div>

      {users.length > 0 && (
        <div className="space-y-2 lg:w-200">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-md bg-white flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>{user.name}</strong> ({user.email})
                </p>
                <p>
                  Phone: {user.phone || "N/A"} | Role: {user.role}
                </p>
              </div>

              <div className="flex place-items-center gap-2">
                {/* Block User */}
                <Button
                  onClick={async () => {
                    const newStatus =
                      user.role === "blocked" ? "user" : "blocked";
                    await updateUserRole(user.id, newStatus);
                    handleSearch(); // refresh list
                  }}
                  variant={
                    user.role === "blocked" ? "destructive" : "destructive"
                  }
                >
                  {user.role === "blocked" ? "Unblock" : "Block"}
                </Button>

                {/* Toggle Role */}
                <Button
                  onClick={async () => {
                    await toggleUserRole(user.id);
                    handleSearch(); // Refresh user list
                  }}
                >
                  {user.role === "admin" ? "Hacer User" : "Hacer Admin"}
                </Button>

                {/* Delete User */}
                <DeleteUserButton
                  userId={user.id}
                  userName={user.name || "Unnamed"}
                  onSuccess={handleSearch}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

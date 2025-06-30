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
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center">
        {/* Search Section */}
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Input
              placeholder="Buscar por Nombre"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {users.length > 0 && (
          <div className="w-full max-w-6xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
              Resultados de búsqueda ({users.length} usuario
              {users.length !== 1 ? "s" : ""})
            </h2>

            {/* Desktop Layout */}
            <div className="hidden lg:block space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-md bg-white flex justify-between items-center shadow-sm"
                >
                  <div>
                    <p className="text-lg">
                      <strong>{user.name}</strong> ({user.email})
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {user.phone || "N/A"} | Role: {user.role}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Block User */}
                    <Button
                      onClick={async () => {
                        const newStatus =
                          user.role === "blocked" ? "user" : "blocked";
                        await updateUserRole(user.id, newStatus);
                        handleSearch(); // refresh list
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      {user.role === "blocked" ? "Unblock" : "Block"}
                    </Button>

                    {/* Toggle Role */}
                    <Button
                      onClick={async () => {
                        await toggleUserRole(user.id);
                        handleSearch(); // Refresh user list
                      }}
                      size="sm"
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

            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-md bg-white shadow-sm"
                >
                  {/* User Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1">{user.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600">
                      <span>Phone: {user.phone || "N/A"}</span>
                      <span className="font-medium">
                        Role:{" "}
                        <span
                          className={`
                          px-2 py-1 rounded text-xs uppercase
                          ${
                            user.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "blocked"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        `}
                        >
                          {user.role}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Block User */}
                    <Button
                      onClick={async () => {
                        const newStatus =
                          user.role === "blocked" ? "user" : "blocked";
                        await updateUserRole(user.id, newStatus);
                        handleSearch(); // refresh list
                      }}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      {user.role === "blocked" ? "Unblock" : "Block"}
                    </Button>

                    {/* Toggle Role */}
                    <Button
                      onClick={async () => {
                        await toggleUserRole(user.id);
                        handleSearch(); // Refresh user list
                      }}
                      size="sm"
                      className="w-full"
                    >
                      {user.role === "admin" ? "Hacer User" : "Hacer Admin"}
                    </Button>

                    {/* Delete User */}
                    <div className="w-full">
                      <DeleteUserButton
                        userId={user.id}
                        userName={user.name || "Unnamed"}
                        onSuccess={handleSearch}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {query && !loading && users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              No se encontraron usuarios con ese nombre
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Intenta con un término de búsqueda diferente
            </p>
          </div>
        )}

        {/* Initial State Message */}
        {!query && users.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              Ingresa un nombre para buscar usuarios
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

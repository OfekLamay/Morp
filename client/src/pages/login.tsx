import React, { useState } from "react";
import { useUser } from "../context/UserContext";

export default function Login() {
  const { login } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // For demo: mock user data
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, call your backend here and get user info + token
    login({
      id: "1",
      username,
      fullName: "Alice Smith",
      permissionGroup: "merkaz_manager",
      kabam: "Kabam A",
      unit: "Unit 1",
      parentUnit: "Parent Unit",
      token: "mock-token",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xs mx-auto mt-20 p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Login</h2>
      <input
        className="block w-full mb-2 p-2 border rounded"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        className="block w-full mb-4 p-2 border rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="w-full bg-primary text-white py-2 rounded" type="submit">
        Login
      </button>
    </form>
  );
}
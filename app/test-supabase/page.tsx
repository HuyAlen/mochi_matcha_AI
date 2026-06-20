"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestSupabasePage() {
  const [result, setResult] = useState("Chưa test");

  async function testConnection() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setResult(`Lỗi: ${error.message}`);
        return;
      }

      setResult(
        data.session
          ? `Đã có session: ${data.session.user.email}`
          : "Supabase OK - chưa đăng nhập",
      );
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Lỗi không xác định");
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Test Supabase</h1>

      <button
        onClick={testConnection}
        className="mt-4 rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white"
      >
        Test Connection
      </button>

      <p className="mt-4 text-sm text-slate-700">{result}</p>
    </main>
  );
}

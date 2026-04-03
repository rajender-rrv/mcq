'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BreadcrumbComp from "../layout/shared/breadcrumb/BreadcrumbComp";
import { BookOpen, Clock } from "lucide-react";

type Widget = {
  id: number;
  title: string;
  total_questions: number;
  duration: number;
};

const colors = [
  "from-blue-500 to-blue-400",
  "from-green-500 to-green-400",
  "from-purple-500 to-purple-400",
  "from-orange-500 to-orange-400",
];

const Page = () => {
  const router = useRouter();

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [starting, setStarting] = useState(false);

  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Templates" },
  ];

  // ✅ Fetch widgets
  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const res = await fetch("/matdash-nextjs/api/test"); // ✅ correct path
        const data = await res.json();

        const formatted = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          total_questions: item.total_questions,
          duration: item.duration,
        }));

        setWidgets(formatted);
      } catch (err) {
        console.error("Error fetching widgets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  // ✅ Start API call with template_id
  const handleStart = async () => {
    if (!selectedWidget) return;

    try {
      setStarting(true);

      const payload = {
        template_id: selectedWidget.id, // ✅ IMPORTANT
      };

      console.log("📤 Sending:", payload);

      const res = await fetch("/matdash-nextjs/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("📥 Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to start test");
      }

      setSelectedWidget(null);
	console.log("attempt_id::"+data.user.attempt_id);
	var user_attempt_id = data.user.attempt_id;
if (user_attempt_id === undefined) {
	alert("Error:"+data.user.detail);
	return;
}
      // ✅ Redirect with ID
      router.push(`/test/attempt/${user_attempt_id}/edit`);

    } catch (err: any) {
      console.error("❌ ERROR:", err);
      alert(err.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <BreadcrumbComp title="Templates" items={BCrumb} />

      <div className="rounded-xl shadow-sm bg-white dark:bg-darkgray p-6 w-full">
        <div className="mt-6">

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-12 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="lg:col-span-3 md:col-span-6 col-span-12">
                  <div className="h-40 rounded-2xl bg-gray-200 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (

            <div className="grid grid-cols-12 gap-6">
              {widgets.map((item, index) => (
                <div
                  key={item.id}
                  className="lg:col-span-3 md:col-span-6 col-span-12"
                >
                  <div
                    onClick={() => setSelectedWidget(item)}
                    className={`relative rounded-2xl p-5 h-40 
                    bg-gradient-to-br ${colors[index % colors.length]} 
                    text-white overflow-hidden 
                    transition-all duration-300 
                    hover:scale-105 hover:shadow-2xl cursor-pointer`}
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full"></div>

                    <div className="flex flex-col justify-between h-full">

                      <div>
                        <p className="text-sm opacity-80">Template</p>
                        <h3 className="text-lg font-semibold">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <BookOpen size={18} />
                          <span className="text-lg font-bold">
                            {item.total_questions}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock size={18} />
                          <span className="text-lg font-bold">
                            {item.duration}m
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

          )}
        </div>
      </div>

      {/* ✅ MODAL */}
      {selectedWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          
          <div className="bg-white dark:bg-darkgray rounded-xl p-6 w-[400px] shadow-xl">
            
            <h2 className="text-xl font-semibold mb-4">
              {selectedWidget.title}
            </h2>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>📘 Total Questions: {selectedWidget.total_questions}</p>
              <p>⏱ Duration: {selectedWidget.duration} minutes</p>
              <p>🎯 Instructions: Answer all questions carefully.</p>
              <p>🚀 Click start to begin the test.</p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedWidget(null)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleStart}
                disabled={starting}
                className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-50"
              >
                {starting ? "Starting..." : "Start"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Page;
export async function POST(req) {
  const body = await req.json();
  const { userId, title } = body;

  const newProfile = {
    id: Date.now(),
    title,
  };

  // ⚠️ In real app: save to DB
  return Response.json(newProfile);
}

export async function GET() {
  return Response.json([
    { id: 1, title: "profile1" },
    { id: 2, title: "profile2" },
    { id: 3, title: "profile3" },
	{ id: 4, title: "profile4" },
    { id: 5, title: "profile5" },
    { id: 6, title: "profile6" },
	{ id: 7, title: "profile7" },
    { id: 8, title: "profile8" },
    { id: 9, title: "profile9" },
	{ id: 10, title: "profile10" },
    { id: 11, title: "profile11" },
    { id: 12, title: "profile12" },
	{ id: 13, title: "profile13" },
    { id: 14, title: "profile14" },
    { id: 15, title: "profile15" },
	{ id: 16, title: "profile16" },
    { id: 17, title: "profile17" },
    { id: 18, title: "profile18" },
	{ id: 19, title: "profile19" },
    { id: 20, title: "profile20" },
    { id: 21, title: "profile21" },
	{ id: 22, title: "profile22" },
    { id: 23, title: "profile23" },
    { id: 24, title: "profile24" },
	{ id: 25, title: "profile25" },
    { id: 26, title: "profile26" },
    { id: 27, title: "profile27" },
	{ id: 28, title: "profile28" },
    { id: 29, title: "profile29" },
    { id: 30, title: "profile30" }
  ]);
}

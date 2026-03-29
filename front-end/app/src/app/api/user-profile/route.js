let users = [
  {
    id: 1,
    name: "user1",
    profiles: [
      { id: 1, title: "profile1" },
      { id: 2, title: "profile2" },
    ],
  },
  {
    id: 2,
    name: "user2",
    profiles: [{ id: 3, title: "profile3" }],
  },
   {
    id: 3,
    name: "user3",
    profiles: [{ id: 4, title: "profile4" }],
  },
   {
    id: 4,
    name: "user4",
    profiles: [{ id: 5, title: "profile5" }],
  },
   {
    id: 5,
    name: "user5",
    profiles: [{ id: 6, title: "profile6" }],
  },
   {
    id: 6,
    name: "user6",
    profiles: [{ id: 7, title: "profile7" }],
  },
   {
    id: 7,
    name: "user7",
    profiles: [{ id: 8, title: "profile8" }],
  },
   {
    id: 8,
    name: "user8",
    profiles: [{ id: 9, title: "profile9" }],
  },
   {
    id: 9,
    name: "user9",
    profiles: [{ id: 10, title: "profile10" }],
  },
   {
    id: 10,
    name: "user10",
    profiles: [{ id: 11, title: "profile11" }],
  },
   {
    id: 11,
    name: "user11",
    profiles: [{ id: 12, title: "profile12" }],
  },
   {
    id: 12,
    name: "user12",
    profiles: [{ id: 13, title: "profile13" }],
  },
   {
    id: 13,
    name: "user13",
    profiles: [{ id: 14, title: "profile14" }],
  },
];

let profilesMaster = [
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
  ];

// ➕ Assign
export async function POST(req) {
  const { userId, profileId } = await req.json();

  // 🔥 Prevent duplicate assignment globally
  const alreadyAssigned = users.some((u) =>
    u.profiles.some((p) => p.id == profileId)
  );

  if (alreadyAssigned) {
    return Response.json(
      { error: "Profile already assigned" },
      { status: 400 }
    );
  }

  const profile = profilesMaster.find((p) => p.id == profileId);

  return Response.json(profile);
}

// ❌ Remove
export async function DELETE(req) {
  return Response.json({ success: true });
}
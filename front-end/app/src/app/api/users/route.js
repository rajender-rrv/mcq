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

export async function GET() {
  return Response.json(users);
}
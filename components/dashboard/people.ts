export type Person = {
  name: string;
  email: string;
  initials: string;
  color: string;
  role: string;
  status: string;
  joined: string;
  verified: boolean;
};
export const initialPeople: Person[] = [
  {
    name: "Olivia Rhye",
    email: "olivia@acme.com",
    initials: "OR",
    color: "lavender",
    role: "Admin",
    status: "Active",
    joined: "Jan 12, 2025",
    verified: true,
  },
  {
    name: "Phoenix Baker",
    email: "phoenix@acme.com",
    initials: "PB",
    color: "peach",
    role: "User",
    status: "Active",
    joined: "Jan 11, 2025",
    verified: true,
  },
  {
    name: "Lana Steiner",
    email: "lana@acme.com",
    initials: "LS",
    color: "mint",
    role: "Moderator",
    status: "Active",
    joined: "Jan 10, 2025",
    verified: true,
  },
  {
    name: "Demi Wilkinson",
    email: "demi@acme.com",
    initials: "DW",
    color: "rose",
    role: "User",
    status: "Pending",
    joined: "Jan 09, 2025",
    verified: false,
  },
  {
    name: "Candice Wu",
    email: "candice@acme.com",
    initials: "CW",
    color: "blue",
    role: "Support agent",
    status: "Active",
    joined: "Jan 08, 2025",
    verified: true,
  },
  {
    name: "Natali Craig",
    email: "natali@acme.com",
    initials: "NC",
    color: "gold",
    role: "User",
    status: "Suspended",
    joined: "Jan 07, 2025",
    verified: true,
  },
  {
    name: "Drew Cano",
    email: "drew@acme.com",
    initials: "DC",
    color: "mint",
    role: "User",
    status: "Active",
    joined: "Jan 06, 2025",
    verified: true,
  },
];

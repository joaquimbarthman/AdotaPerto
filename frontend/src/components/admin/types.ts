export type StatusCount = { status: string; total: number };
export type Overview = {
  generatedAt: string;
  users: number;
  organizations: number;
  newUsers: number;
  activeSessions: number;
  animals: StatusCount[];
  items: StatusCount[];
  adoptions: StatusCount[];
  donations: StatusCount[];
  recentUsers: {
    id: string;
    name: string;
    role: string | null;
    city: string | null;
    state: string | null;
    createdAt: string;
  }[];
};

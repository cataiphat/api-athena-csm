export interface CreateTeamRequest {
  name: string;
  description?: string;
  departmentId: string;
  leaderId?: string;
  memberIds?: string[];
  workingHours?: WorkingHoursInput[];
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  leaderId?: string;
  memberIds?: string[];
  workingHours?: WorkingHoursInput[];
}

export interface WorkingHoursInput {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
  isActive?: boolean;
}

export interface TeamResponse {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  leaderId?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  department?: {
    id: string;
    name: string;
  };
  leader?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
  workingHours?: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
  _count?: {
    members: number;
    tickets: number;
  };
}

export interface TeamListResponse {
  teams: TeamResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TeamStatsResponse {
  totalTeams: number;
  activeTeams: number;
  totalMembers: number;
  averageMembersPerTeam: number;
  teamsWithWorkingHours: number;
}

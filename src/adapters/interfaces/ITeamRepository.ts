export interface TeamInfo {
    id: string;
    name: string;
    invite_code?: string;
}

export interface ITeamRepository {
    createTeam(name: string): Promise<TeamInfo>;
    joinTeam(inviteCode: string): Promise<TeamInfo>;
}

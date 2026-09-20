export type ClubType = "study" | "club";

export interface ClubTypeRule{
    label: string;
    emoji: string;
    minMembers: number;
}

export const CLUB_TYPES: Record<ClubType, ClubTypeRule> = {
    study: { label: "스터디", emoji: "✏️", minMembers: 4},
    club: { label: "클럽", emoji: "🎮", minMembers: 5},
};

export const LEADER_LABELS = ["스터디장", "길드장"] as const;

export const roleName = (clubName: string) => `[길드 : ${clubName}]`;
export const categoryName = (clubName: string) => `[길드] | ${clubName}`;
import { CLUB_TYPES, LEADER_LABELS, type ClubType } from "../config.js";

export interface ParsedPost{
    type: ClubType;
    name: string;
    leaderId: string;
}

export type ParseResult = 
    | { ok: true; post: ParsedPost }
    | { ok: false; reason: string };

function stripVariation(value: string): string {
    return value.replace(/\uFE0F/g, "");
}

const MENTION = /<@!?(\d+)>/;

export function parseRecruitPost(title: string, body: string): ParseResult{
    const cleanTitle = stripVariation(title).trim();

    const types = Object.keys(CLUB_TYPES) as ClubType[];
    const type = types.find((key) =>
        cleanTitle.startsWith(stripVariation(CLUB_TYPES[key].emoji)),
    );

    if(!type){
        return { ok: false, reason: "제목 맨 앞에서 길드 종류 이모지를 찾지 못했습니다."};
    }

    const name = cleanTitle.match(/\[([^\]]+)\]/)?.[1]?.trim();

    if(!name){
        return { ok: false, reason: "제목에서 [길드 이름]을 찾지 못했습니다."}
    }

    const leaderLine = body
        .split("\n")
        .find((line) => LEADER_LABELS.some((label) => line.includes(label)));

    if(!leaderLine){
        return {
            ok: false,
            reason: `본문에서 ${LEADER_LABELS.join(" 또는 ")} 줄을 찾지 못했습니다.`,
        };
    }

    const leaderId = leaderLine.match(MENTION)?.[1];

    if(!leaderId){
        return { ok: false, reason: "길드장 줄에 멘션이 없습니다."};
    }

    return { ok: true, post: { type, name, leaderId } };
}
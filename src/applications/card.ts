import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type TextChannel,
} from "discord.js";
import { CLUB_TYPES } from "../config.js";
import { countMembers, getClub } from "../db.js";
import type { Application } from "./watch.js";

export const APPROVE = "approve";
export const IGNORE = "ignore";

export function buildCard(application: Application){
    const club = getClub(application.postId);

    const embed = new EmbedBuilder()
        .setTitle("새 가입 신청")
        .setColor(0x5865f2)
        .addFields(
            { name: "길드", value: club?.name ?? application.postName },
            { name: "신청자", value: `<@${application.userId}>` },
            { name: "신청 내용", value: application.content.slice(0, 1000) || "(내용 없음)" },
        );

    if(club){
        const rule = CLUB_TYPES[club.type];
        embed.addFields({
            name: "현재 인원",
            value: `${countMembers(club.post_id)} / ${rule.minMembers}명 (${rule.label})`,
        });
    }

    const suffix = `${application.postId}:${application.userId}`;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`${APPROVE}:${suffix}`)
            .setLabel("승인")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`${IGNORE}:${suffix}`)
            .setLabel("무시")
            .setStyle(ButtonStyle.Secondary),
    );

    return { embeds: [embed], components: [row] };
}

export async function sendCard(
    channel: TextChannel,
    application: Application,
): Promise<void> {
    await channel.send(buildCard(application));
}
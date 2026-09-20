import { Events, MessageFlags, type Client } from "discord.js";
import { addMember, countMembers, getClub, markHandled } from "../db.js";
import { CLUB_TYPES } from "../config.js";
import { APPROVE, IGNORE } from "./card.js"

export function handleCardButtons(client: Client): void {
    client.on(Events.InteractionCreate, async (interaction) => {
        if(!interaction.isButton()) return;

        const [action, postId, userId] = interaction.customId.split(":");

        if(action !== APPROVE && action !== IGNORE) return;
        if(!postId || !userId) return;

        if(action === IGNORE){
            await interaction.update({
                content: `무시됨 (${interaction.user.tag})`,
                components: [],
            });
            return;
        }

        const club = getClub(postId);

        if(!club){
            await interaction.reply({
                content: "길드 정보를 찾을 수 없습니다.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        addMember(postId, userId);

        const count = countMembers(postId);
        const rule = CLUB_TYPES[club.type];

        await interaction.update({
            content: `승인됨 (${interaction.user.tag}) . ${count}/${rule.minMembers}명`,
            components: [],
        });

        if(count >= rule.minMembers && club.status === "recruiting") {
            console.log(`[개설 대상] ${club.name} - ${count}/${rule.minMembers}명`);
        }
    });
}
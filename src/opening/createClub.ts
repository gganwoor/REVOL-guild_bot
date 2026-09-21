import {
    ChannelType,
    PermissionFlagsBits,
    PermissionsBitField,
    type CategoryChannel,
    type Guild,
    type Role,
} from "discord.js";
import { CLUB_TYPES, categoryName, roleName, type ClubType} from "../config.js";
import { env } from "../env.js";
import { permission } from "process";

export interface CreateClubInput{
    server: Guild;
    name: string;
    type: ClubType;
    memberIds: string[];
}

export interface CreateClubResult{
    role: Role;
    category: CategoryChannel;
}

export async function createClub(input: CreateClubInput):
Promise<CreateClubResult> {
    const { server, name, type, memberIds } = input;

    const role = await server.roles.create({
        name: roleName(name),
        color: type === "study" ? 0x5865f2 : 0xeb459e,
        mentionable: true,
        reason: `길드 개설: ${name}`,
    });

    try{
        const category = await server.channels.create({
            name: categoryName(name),
            type: ChannelType.GuildCategory,
            reason: `길드 개설: ${name}`,
            permissionOverwrites: [
                {
                    id: server.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.SendMessagesInThreads,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                    ],
                },
                {
                    id: env.staffRoleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                },
                {
                    id: server.members.me!.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels],
                },
            ],
        });

        await server.channels.create({
            name: "대화방",
            type: ChannelType.GuildText,
            parent: category.id,
        });
        await server.channels.create({
            name: "활동포스트",
            type: ChannelType.GuildForum,
            parent: category.id,
        });
        await server.channels.create({
            name: "음성채널",
            type: ChannelType.GuildVoice,
            parent: category.id,
        });

        for(const memberId of memberIds){
            const member = await server.members.fetch(memberId).catch(() => null);
            await member?.roles.add(role, `길드 개설: ${name}`);
        }

        return { role, category };
    } catch (error){
        await role.delete(`길드 개설 실패: ${name}`).catch(() => {});
        throw error;
    }
}
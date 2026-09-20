import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js";
import { env } from "./env.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.once(Events.ClientReady, async (ready) => {
    console.log(`${ready.user.tag} 로그인 완료`);

    const board = await ready.channels.fetch(env.boardForumId);

    if(board?.type !== ChannelType.GuildForum){
        throw new Error("BOARD_FORUM_ID가 포럼 채널이 아닙니다.");
    }

    console.log(`게시판 연결됨: ${board.name}`);
});

await client.login(env.token);
import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js";
import { CLUB_TYPES } from "./config.js";
import { env } from "./env.js";
import { fetchAllPosts, fetchPostBody } from "./recruit/fetchPosts.js";
import { parseRecruitPost } from "./recruit/parse.js";
import { watchApplications } from "./applications/watch.js";

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

    const posts = await fetchAllPosts(board);
    console.log(`게시판 "${board.name}" 포스트 ${posts.length}개`);

    for(const post of posts){
        if(env.ignoredPostIds.includes(post.id)){
            console.log(`   [제외] ${post.name}`);
            continue;
        }

        const body = await fetchPostBody(post);
        const result = parseRecruitPost(post.name, body);

        if(!result.ok){
            console.log(`   [실패] ${post.name} - ${result.reason}`);
            continue;
        }

        const { type, name, leaderId } = result.post;
        console.log(
            `   [인식] ${name} . ${CLUB_TYPES[type].label} . 길드장 ${leaderId} . 최소 ${CLUB_TYPES[type].minMembers}명`,
        );
    }
});

watchApplications(client, async (application) => {
    console.log(
        `[신청] ${application.postName} . <@${application.userId}> . ${application.content}`,
    );
});

await client.login(env.token);
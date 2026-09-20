import { Client, Events, GatewayIntentBits } from "discord.js";

const token = process.env.DISCORD_TOKEN;

if(!token){
    throw new Error("DISCORD_TOKEN이 비어 있습니다.");
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.once(Events.ClientReady, (ready) => {
    console.log(`${ready.user.tag} 로그인 완료`);
    console.log(`참여 중인 서버 ${ready.guilds.cache.size}개`);

    for(const guild of ready.guilds.cache.values()){
        console.log(`- ${guild.name} (${guild.id})`);
    }
});

await client.login(token);
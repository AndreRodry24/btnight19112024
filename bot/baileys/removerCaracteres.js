// Função para remover participantes em caso de mensagens longas com texto ou legendas em imagens
export async function removerCaracteres(c, mensagem) {
    // Obtém o texto da mensagem, seja como 'conversation' ou como legenda de imagem
    const textoMensagem = mensagem.message?.conversation || mensagem.message?.imageMessage?.caption;

    // Verifica se há mensagem de texto ou legenda
    if (textoMensagem) {
        // Texto das regras do grupo (resumo ou palavras-chave para identificação)
        const textoDasRegras = [
            "⚠️ *REGRAS DO GRUPO!* ⚠️",
            "🚫 PROIBIDO:",
            "🔞 NÃO é permitido qualquer tipo de conteúdo impróprio ou ilegal.",
            "🔗 *LINKS DE PROMOÇÃO*",
            "👏🍻DﾑMﾑS💃🔥Dﾑ NIGӇԵ💃🎶🍾🍸",
            "⚠️ *REGRAS IMPORTANTES:*"
        ];

        // Verifica se a mensagem contém as regras (evita remoção)
        if (textoDasRegras.some(regra => textoMensagem.includes(regra))) {
            console.log("Mensagem identificada como REGRAS DO GRUPO. Não será removida.");
            return; // Sai da função sem apagar ou banir
        }

        // Verifica o comprimento total do texto
        const comprimentoTotal = textoMensagem.length;

        // Obtém o ID do usuário que enviou a mensagem
        const usuarioId = mensagem.key.participant || mensagem.key.remoteJid;
        const grupoId = mensagem.key.remoteJid;

        // Verifica se o usuário é um administrador no grupo
        const metadata = await c.groupMetadata(grupoId);
        const isAdmin = metadata.participants.some(participant => 
            participant.id === usuarioId && 
            (participant.admin === 'admin' || participant.admin === 'superadmin')
        );

        // Apenas se o usuário NÃO for administrador
        if (!isAdmin) {
            // Verifica se a mensagem ou legenda tem mais de 950 caracteres
            if (comprimentoTotal > 950) {
                try {
                    // Apaga a mensagem do grupo
                    await c.sendMessage(grupoId, { delete: mensagem.key });

                    // Remove o usuário do grupo
                    await c.groupParticipantsUpdate(grupoId, [usuarioId], 'remove');
                    
                    // Envia uma mensagem de aviso ao grupo
                    await c.sendMessage(grupoId, { 
                        text: '✅🚫 𝐔𝐬𝐮𝐚𝐫𝐢𝐨 𝐛𝐚𝐧𝐢𝐝𝐨(a) 𝐩𝐨𝐫 𝐦𝐞𝐧𝐬𝐚𝐠𝐞𝐦 𝐬𝐮𝐬𝐩𝐞𝐢𝐭𝐚 𝐜𝐨𝐦 𝐦𝐮𝐢𝐭𝐨𝐬 𝐜𝐚𝐫𝐚𝐜𝐭𝐞𝐫𝐞𝐬 𝐞𝐬𝐩𝐞𝐜𝐢𝐚𝐢𝐬 ✨💥 𝐞 𝐞𝐱𝐭𝐫𝐞𝐦𝐚𝐦𝐞𝐧𝐭𝐞𝐧𝐭𝐞 𝐥𝐨𝐧𝐠𝐚! 📝⛔' 
                    });

                    console.log(`Usuário ${usuarioId} banido por mensagem longa.`);
                } catch (error) {
                    console.error(`Erro ao remover participante:`, error);
                    await c.sendMessage(grupoId, { text: 'Erro ao tentar banir o usuário. ❌' });
                }
            }
        } else {
            console.log(`Usuário ${usuarioId} é administrador e não será removido.`);
        }
    }
}

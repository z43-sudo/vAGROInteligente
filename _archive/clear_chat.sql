-- Limpar todas as mensagens do chat
TRUNCATE TABLE messages;

-- OU, se preferir apagar apenas de uma fazenda específica (substitua o ID):
-- DELETE FROM messages WHERE farm_id = 'farm_123...';

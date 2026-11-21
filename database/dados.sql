
-- ============================================
-- CAMÉLIA BEAUTY
-- Dados iniciais do banco de dados
-- 4 categorias e 25 produtos fictícios
-- ============================================

-- 1. Cadastro das categorias
INSERT INTO categorias (nome)
VALUES
    ('Cuidados com a pele'),
    ('Maquiagem'),
    ('Cabelos'),
    ('Corpo')
ON CONFLICT (nome) DO NOTHING;


-- 2. Cadastro dos produtos
-- Os IDs são gerados automaticamente pelo PostgreSQL.

WITH produtos_iniciais (nome, descricao, preco, imagem, categoria) AS (
    VALUES
    ('Cristal Brilhante', 'Gloss labial com brilho delicado.', 32.90, 'https://placehold.co/400x400/eadbd0/665b50?text=Gloss+Cristal', 'Maquiagem'),
    ('Óleo Corporal Encanto', 'Óleo corporal para massagem e hidratação.', 57.90, 'https://placehold.co/400x400/e9e0d5/665b50?text=Encanto', 'Corpo'),
    ('Sérum Lumina', 'Sérum facial para a rotina diária de cuidados.', 69.90, 'https://placehold.co/400x400/f0e6d8/665b50?text=Serum+Lumina', 'Cuidados com a pele'),
    ('Paleta Encanto', 'Paleta com tons neutros e delicados.', 74.90, 'https://placehold.co/400x400/eadbd0/665b50?text=Paleta+Encanto', 'Maquiagem'),
    ('Body Splash Jardim', 'Fragrância corporal leve para o dia a dia.', 49.90, 'https://placehold.co/400x400/e9e0d5/665b50?text=Jardim', 'Corpo'),
    ('Batom Rosé', 'Batom cremoso em tom rosado.', 39.90, 'https://placehold.co/400x400/eadbd0/665b50?text=Batom+Rose', 'Maquiagem'),
    ('Sabonete Líquido Camélia', 'Sabonete líquido para o banho.', 29.90, 'https://placehold.co/400x400/e9e0d5/665b50?text=Camélia', 'Corpo'),
    ('Blush Pétala', 'Corar em tom suave.', 45.90, 'https://placehold.co/400x400/eadbd0/665b50?text=Blush+Petala', 'Maquiagem'),
    ('Loção Corporal Amêndoas', 'Loção corporal de toque suave.', 46.90, 'https://placehold.co/400x400/e9e0d5/665b50?text=Amendoas', 'Corpo'),
    ('Espuma Suave', 'Espuma para limpeza facial.', 39.90, 'https://placehold.co/400x400/f0e6d8/665b50?text=Espuma+Suave', 'Cuidados com a pele'),
    ('Protetor Solar Solaré', 'Protetor solar para a rotina diária.', 79.90, 'https://placehold.co/400x400/f0e6d8/665b50?text=Solare', 'Cuidados com a pele'),
    ('Shampoo Flor de Seda', 'Shampoo para a rotina de cuidados capilares.', 42.90, 'https://placehold.co/400x400/e6e0d4/665b50?text=Flor+de+Seda', 'Cabelos'),
    ('Condicionador Brilho Real', 'Condicionador para uso diário.', 44.90, 'https://placehold.co/400x400/e6e0d4/665b50?text=Brilho+Real', 'Cabelos'),
    ('Creme Aurora', 'Creme facial de textura leve.', 59.90, 'https://placehold.co/400x400/f0e6d8/665b50?text=Creme+Aurora', 'Cuidados com a pele'),
    ('Máscara Pure Glow', 'Máscara facial para momentos de autocuidado.', 44.90, 'https://placehold.co/400x400/f0e6d8/665b50?text=Pure+Glow', 'Cuidados com a pele'),
    ('Água Micelar Flor de Chá', 'Água micelar para limpeza da pele.', 35.90, 'https://placehold.co/400x400/f0e6d8/665b50?text=Flor+de+Cha', 'Cuidados com a pele'),
    ('Máscara de Cílios Intense', 'Máscara para destacar os atraentes.', 49.90, 'https://placehold.co/400x400/eadbd0/665b50?text=Intenso', 'Maquiagem'),
    ('Máscara Capilar Essenza', 'Máscara para momentos de cuidado capilar.', 64.90, 'https://placehold.co/400x400/e6e0d4/665b50?text=Essenza', 'Cabelos'),
    ('Esfoliante Doce Flor', 'Esfoliante corporal para rotina de cuidado.', 39.90, 'https://placehold.co/400x400/e9e0d5/665b50?text=Doce+Flor', 'Corpo'),
    ('Leave-in Seda Pura', 'Creme sem enxágue para finalização.', 48.90, 'https://placehold.co/400x400/e6e0d4/665b50?text=Seda+Pura', 'Cabelos'),
    ('Óleo Capilar Dourado', 'Óleo finalizador para os fios.', 55.90, 'https://placehold.co/400x400/e6e0d4/665b50?text=Oleo+Dourado', 'Cabelos'),
    ('Creme para Mãos Delicada', 'Creme para o cuidado diário das mãos.', 24.90, 'https://placehold.co/400x400/e9e0d5/665b50?text=Delicata', 'Corpo'),
    ('Veludo Hidratante', 'Hidratante facial para uso diário.', 54.90, 'https://placehold.co/400x400/f0e6d8/665b50?text=Veludo', 'Cuidados com a pele'),
    ('Sérum Capilar Lumina', 'Sérum para finalização dos cabelos.', 52.90, 'https://placehold.co/400x400/e6e0d4/665b50?text=Serum+Capilar', 'Cabelos'),
    ('Pele Natural Base', 'Base de acabamento natural.', 89.90, 'https://placehold.co/400x400/eadbd0/665b50?text=Natural+Skin', 'Maquiagem')
)

INSERT INTO produtos (nome, descricao, preco, imagem, categoria_id)
SELECT
    pi.nome,
    pi.descricao,
    pi.preco,
    pi.imagem,
    c.id
FROM produtos_iniciais pi
JOIN categorias c
    ON c.nome = pi.categoria
WHERE NOT EXISTS (
    SELECT 1
    FROM produtos p
    WHERE p.nome = pi.nome
);


-- 3. Conferência dos dados cadastrados
SELECT
    c.nome AS categoria,
    COUNT(p.id) AS quantidade_produtos
FROM categorias c
LEFT JOIN produtos p
    ON p.categoria_id = c.id
    AND p.ativo = TRUE
GROUP BY c.id, c.nome
ORDER BY c.nome;

-- Total esperado: 25 produtos.

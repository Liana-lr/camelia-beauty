-- ============================================
-- CAMÉLIA BEAUTY
-- Atualização da tabela de clientes
-- Dados necessários para a entrega dos pedidos
-- ============================================

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS cep VARCHAR(9);

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS endereco VARCHAR(200);

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS numero VARCHAR(20);

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

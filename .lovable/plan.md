

## Plano: Gerar SQL Limpo e Completo para o Banco de Dados

### O que sera feito

Criar um novo arquivo `server/cebio_database_production.sql` — um SQL limpo, organizado e pronto para producao, substituindo o `cebio_database.sql` desatualizado.

### Problemas no SQL atual

- O `cebio_database.sql` tem o ENUM de status de projetos incompleto (falta `rascunho`, `aguardando_autores`, `devolvido`)
- Contem dados de teste misturados com a estrutura
- A tabela `project_links` nao tem os campos `link_type` e `description` que o dump atualizado mostra
- Senhas em SHA256 puro (o backend ja migra para bcrypt, mas o seed deve usar bcrypt)

### Conteudo do novo SQL

**Estrutura (12 tabelas na ordem correta de dependencias):**
1. `users` — com todos os campos (cpf, phone, department, birth_date, registration_number)
2. `categories` — com slug, color, icon
3. `academic_levels` — com order
4. `projects` — com ENUM completo (7 status) e campos de pending_edit
5. `project_authors` — com approval_status e vinculo por CPF
6. `project_versions` — versionamento por campo
7. `project_comments`
8. `project_links` — com link_type e description
9. `project_files` — com file_category
10. `audit_logs` — com severity
11. `notifications` — com notification_type e category
12. `system_config`

**Dados iniciais (seed limpo):**
- 3 usuarios padrao (admin, pesquisador, bolsista) com senhas SHA256 (o backend migra automaticamente para bcrypt no primeiro login)
- 5 categorias
- 5 niveis academicos
- 5 projetos de exemplo
- Configuracoes do sistema

**Indices e constraints:**
- Foreign keys com ON DELETE CASCADE/SET NULL conforme as entidades TypeORM
- Indices em campos de busca frequente (status, owner_id, cpf, user_id)

### Detalhes tecnicos

- Compativel com MySQL 8.x e MariaDB 10.6+
- Charset utf8mb4 com collation unicode_ci
- DROP TABLE IF EXISTS na ordem inversa de dependencias (evita erro de FK)
- Comentarios em portugues para facilitar manutencao
- Separacao clara entre ESTRUTURA e DADOS INICIAIS

### Resultado

Um unico arquivo SQL que pode ser importado com `mysql -u root -p cebio_brasil < cebio_database_production.sql` para criar o banco completo do zero, pronto para producao.


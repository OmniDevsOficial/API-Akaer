<h1 align="center"> OmniDevs </h1>

<div align="center">
    <img src="img/OmniDevs.jpeg" width="170x" height="170x" style="border-radius:50%;">
</div>

## API - Plataforma do Conteúdo Técnico de Normas Aeronáuticas  

<p align="center">
| <a href="#objetivo"> Objetivo </a> |
  <a href="#backlog-do-produto"> Backlog do Produto </a> |
  <a href="#tecnologias-utilizadas"> Tecnologias </a> |
  <a href="#definition-of-ready"> DoR </a> | 
  <a href="#definition-of-done"> DoD </a> | 
  <a href="#sprint"> Cronograma de Sprints </a> | 
  <a href="#como-executar-o-projeto">Como Executar o Projeto</a> |
  <a href="#equipe"> Equipe </a> |
</p>

## 📌 Status do Projeto
| Item                  | Situação |
|-----------------------|---------------|
| 🚧 Projeto            | 🔛 Em andamento  |
| 📂 Documentação       | 🔛 Em andamento  |

## Objetivo <a id="objetivo"></a>
O desafio consiste em desenvolver uma plataforma web estruturada para centralizar, organizar e correlacionar requisitos normativos. O sistema visa transformar o processo atual, que é manual e descentralizado, em uma fonte de dados organizada que reduza o tempo de busca e o risco de inconsistências no uso de versões obsoletas, apoiando a equipe de administradores e visualizadores.

---

## 📋 Backlog do Produto <a id="backlog-do-produto"></a>

| Rank | Prioridade | User Story | Estimativa | Sprint |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| 🎗  1 | Alta | Como Administrador, quero cadastrar normas no sistema, para disponibilizar essa documentação aos visualizadores. | 8 | 1 |
| 🎗  2 | Alta | Como Visualizador, quero acessar a plataforma no cargo de leitor, para consultar o acervo sem o risco de alterar os dados. | 7 | 1 |
| 🎗  3 | Alta | Como Administrador, quero realizar login seguro na plataforma, para acessar o ambiente de gestão do sistema. | 6 | 1 |
| 🎗  4 | Alta | Como Visualizador, quero pesquisar normas por palavras-chave, nome ou número, para localizar um documento específico de forma direta. | 10 | 1 |
| 🎗  5 | Alta | Como Visualizador, quero filtrar as normas por órgão emissor, categoria e etapa do projeto, para encontrar rapidamente os documentos exatos da certificação necessária. | 10 | 2 |
| 🎗  6 | Alta | Como Administrador, quero editar os dados de uma norma já cadastrada, para corrigir erros de digitação ou informações incorretas sem precisar criar uma nova revisão no sistema. | 7 | 2 |
| 🎗  7 | Alta | Como Visualizador, quero ler o documento original da norma diretamente na tela sem permissão de download, para garantir o sigilo da informação. | 3 | 2 |
| 🎗  8 | Alta | Como Administrador, quero correlacionar normas no sistema, para que o visualizador possa acessar facilmente as normas associadas. | 10 | 2 |
| 🎗  9 | Média |Como Visualizador, quero enviar uma solicitação, relacionada a uma norma, para que o Técnico ou Administrador possa avaliar e dar andamento ao pedido. | 5 | 2 |
| 🎗  10 | Média | Como Visualizador, quero visualizar a página da norma com seu escopo, para entender corretamente a aplicação da norma no meu projeto sem precisar ler todo o documento. | 5 | 2 |
| 🎗  11 | Média |Como Técnico, quero cadastrar normas no sistema, para disponibilizar essa documentação aos visualizadores. | 5 | 3 |
| 🎗  12 | Média | Como Administrador, quero atualizar uma norma com sua revisão mais recente, para garantir que a equipe utilize sempre a versão vigente. | 5 | 3 |
| 🎗  13 | Média | Como Administrador, quero cadastrar novos usuários no sistema definindo seus níveis de acesso, para permitir que novos funcionários da empresa acessem a documentação. | 5 | 3 |
| 🎗  14 | Média | Como Visualizador, quero acessar o histórico de revisões de uma norma, onde as versões antigas ficam disponíveis e sinalizadas como "obsoletas" junto à atual, para poder consultar informações de projetos passados. | 7 | 3 |
| 🎗  15 | Média | Como Administrador, quero gerenciar o cadastro de usuários como atualizar dados, alterar permissões e desativar contas, para manter o controle e garantir a segurança do sistema. | 8 | 3 |
| 🎗  16 | Baixa | Como Administrador, quero ver o registro de edição das normas, para saber o autor da edição. | 5 | 3 |

---

## 💻Tecnologias Utilizadas <a id="tecnologias-utilizadas"></a>

**Front-end:**
![HTML5](https://img.shields.io/badge/HTML5-FF7E00?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-A020F0?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-FFC30B?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Back-end & SGBD:**
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-FF6600?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-008ECC?style=for-the-badge&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)

**Ferramentas & Deploy:**
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-121011?style=for-the-badge&logo=github&logoColor=white)
![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)


<br>

### 📋Definition of Ready (DoR) <a id="definition-of-ready"></a>

| DoR |
| :--- |
| A História de Usuário está clara e foi entendida por todos |
| Os critérios de aceitação (Dado/Quando/Então) estão definidos |
| O esboço visual (telas/wireframes) e a navegação estão prontas |
| O esforço técnico foi estimado (pontuado) pela equipe |
| Não há pendências ou bloqueios para iniciar o desenvolvimento |


### 📋Definition of Done (DoD) <a id="definition-of-done"></a>

| DoD |
| :--- |
| Funcionalidade Versionada Corretamente |
| Passou por Testes de Usabilidade |
| Documentação Atualizada |

## 📅 Cronograma de Sprints <a id="sprint"></a>

| Sprint | Período | Documentação | Status | Vídeo |
| :--- | :---: | :--- | :--- | :--- |
| **SPRINT 1** | 16/03 - 05/04 | [Sprint 1 docs](docs/sprint1.md) | 🔛 Em andamento | [🎥 Assistir](https://youtu.be/VLJHqNIcwLM) |
| **SPRINT 2** | 13/04 - 03/05 | Sprint 2 docs| 💤 Não iniciado | |
| **SPRINT 3** | 11/05 - 31/05 | Sprint 3 docs| 💤 Não iniciado | |


## 📜 Como Executar o Projeto <a id="como-executar-o-projeto"></a>

### Pré-requisitos

- **Node.js** (Versão LTS recomendada)
- **MySQL Server**
- **Git**

### 1. Clone o Projeto
```
# Em seu terminal usando Git Bash
# Baixe o código do projeto que está no GitHub para sua máquina local.
git clone https://github.com/OmniDevsOficial/API-Akaer.git

# Entre na pasta raiz do projeto que foi clonada.
cd API-Akaer/
```


### 2. Configurando o Banco de Dados
```
# Crie um banco MySQL na sua máquina (ou use um serviço na nuvem).

# Entre na pasta backend.
cd backend/

# Instale todas as dependências do projeto
npm i

# Depois, crie um arquivo .env na raiz do projeto com base no exemplo:
DATABASE_URL = "mysql://[usuário]:[senha]@[host]:[porta]/[nome_do_banco]"

# Rode o prisma studio para criar as tabelas do banco de dados.
npm run db:setup
```

### 3. Configurando o Back-End
```
# Entre na pasta backend.
cd backend/

# Instale todas as dependências do projeto.
npm i

# Rode o projeto em sua máquina em modo desenvolvedor.
npm run dev
```

### 4. Configurando o Front-End
```
# Volte para a pasta raiz ./API-Akaer/ e entre na pasta frontend.
cd frontend/

# Instale todas as dependências do projeto.
npm i

# Rode o projeto na sua máquina em modo desenvolvedor.
npm run dev

# Copie e cole a URL em seu navegador para acessar o projeto em localhost.
http://localhost:5173/
```

## 🎓 Conheça a equipe talentosa por trás do projeto <a id="equipe"></a>
| Foto | Nome | Função | GitHub | LinkedIn |
| :---: | :--- | :--- | :---: | :---: |
| <img src="https://avatars.githubusercontent.com/u/189993239?v=4" width=50px alt="Foto do Marcio"> | **Marcio Gustavo** | Product Owner | <a href="https://github.com/Marcio-gustavoI"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/marciogustavo"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |
| <img src="https://avatars.githubusercontent.com/u/168497458?v=4" width=50px alt="Foto do Henrique"> | **Henrique Moreira** | Scrum Master | <a href="https://github.com/DeveloperCorsair"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/henriquemm/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |
| <img src="https://avatars.githubusercontent.com/u/168978076?v=4" width=50px alt="Foto da Gabriela"> | **Gabriela Santos** | Desenvolvedora | <a href="https://github.com/GabSantt"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/gabriela-santos-b762a9399/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |
| <img src="https://avatars.githubusercontent.com/u/225857087?v=4" width=50px alt="Foto da Kathelyn"> | **Kathelyn Zanin** | Desenvolvedora | <a href="https://github.com/KathelynZanin"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/kathelynzanin/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |
| <img src="https://avatars.githubusercontent.com/u/179191752?v=4" width=50px alt="Foto do Victor"> | **Victor Chagas** | Desenvolvedor | <a href="https://github.com/victorchagas-93"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/victorchagas93/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |
| <img src="https://avatars.githubusercontent.com/u/103455871?v=4" width=50px alt="Foto do Yoseph"> | **Yoseph Levi** | Desenvolvedor | <a href="https://github.com/YosephLima"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/yoseph-levi-rodrigues-de-lima-7020b324a/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |
| <img src="https://avatars.githubusercontent.com/u/225857936?v=4" width=50px alt="Foto do Luis"> | **Luis Guilherme** | Desenvolvedor | <a href="https://github.com/Mactravish552"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/guilhermedecampospinto/?locale=en_US"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |

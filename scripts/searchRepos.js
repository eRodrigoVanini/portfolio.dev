const username = 'eRodrigoVanini';

function updateProjects() {
  const projectCards = document.querySelectorAll('.card-projects[data-repo]');

  projectCards.forEach(async (card) => {
    const repoName = card.getAttribute('data-repo');
    
    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
      
      if (!response.ok) throw new Error('Repositório não encontrado');
      
      const data = await response.json();

      const titleElement = card.querySelector('h3');
      const descElement = card.querySelector('p');
      

      // Atualiza a Descrição com o que está no GitHub
      if (data.description) {
        descElement.textContent = data.description;
      }



      // Atualiza o Link automaticamente (se o href estiver vazio ou desatualizado)
      const linkElement = card.querySelector('a');
      if (linkElement && !linkElement.getAttribute('href')) {
          linkElement.href = data.html_url; // Link para o repo
      }

    } catch (error) {
      console.warn(`Não foi possível carregar dados para ${repoName}:`, error);
    }
  });
}

// Executa quando a página carregar
document.addEventListener('DOMContentLoaded', updateProjects);
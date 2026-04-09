// Estado global
let dados = { receita_mensal: 0, transacoes: [], investimentos: [] };
let mesAtual = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Elementos
const mesLabel = document.getElementById('mes-label');
const btnAnterior = document.getElementById('mes-anterior');
const btnProximo = document.getElementById('mes-proximo');
const receitaInput = document.getElementById('receita-input');
const form = document.getElementById('form-lancamento');
const btnExportar = document.getElementById('btn-exportar');
const inputImportar = document.getElementById('input-importar');

// Inicialização
async function init() {
  try {
    const res = await fetch('./data.json');
    if (res.ok) {
      dados = await res.json();
    }
  } catch (e) {
    console.log('Usando dados vazios.');
  }
  receitaInput.value = dados.receita_mensal || '';
  renderizar();
}

// Navegação de mês
function navMes(delta) {
  const [ano, mes] = mesAtual.split('-').map(Number);
  const d = new Date(ano, mes - 1 + delta, 1);
  mesAtual = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  renderizar();
}

btnAnterior.addEventListener('click', () => navMes(-1));
btnProximo.addEventListener('click', () => navMes(1));

// Receita
receitaInput.addEventListener('change', () => {
  dados.receita_mensal = parseFloat(receitaInput.value) || 0;
});

// Formatação
function formatarMes(chave) {
  const [ano, mes] = chave.split('-').map(Number);
  return MESES[mes - 1] + ' ' + ano;
}

function formatarReal(valor) {
  return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Renderização principal
function renderizar() {
  mesLabel.textContent = formatarMes(mesAtual);

  const fixos = dados.transacoes.filter(t => t.data === mesAtual && t.categoria === 'fixo');
  const credito = dados.transacoes.filter(t => t.data === mesAtual && t.categoria === 'credito');
  const investimentos = dados.investimentos.filter(i => i.data === mesAtual);

  renderizarLista('lista-fixos', 'vazio-fixos', fixos, 'transacoes');
  renderizarLista('lista-credito', 'vazio-credito', credito, 'transacoes');
  renderizarLista('lista-investimentos', 'vazio-investimentos', investimentos, 'investimentos');

  // Totais
  const totalFixos = fixos.reduce((s, t) => s + t.valor, 0);
  const totalCredito = credito.reduce((s, t) => s + t.valor, 0);
  const totalInvest = investimentos.reduce((s, i) => s + i.valor, 0);
  const saldo = dados.receita_mensal - totalFixos - totalCredito;

  document.getElementById('total-fixos').textContent = formatarReal(totalFixos);
  document.getElementById('total-credito').textContent = formatarReal(totalCredito);
  document.getElementById('total-investimentos').textContent = formatarReal(totalInvest);

  const saldoEl = document.getElementById('saldo-disponivel');
  saldoEl.textContent = formatarReal(saldo);
  saldoEl.classList.toggle('negativo', saldo < 0);

  // Patrimônio acumulado: soma de todos os investimentos até o mês atual
  const patrimonioTotal = dados.investimentos
    .filter(i => i.data <= mesAtual)
    .reduce((s, i) => s + i.valor, 0);
  document.getElementById('patrimonio-total').textContent = formatarReal(patrimonioTotal);
}

function renderizarLista(listaId, vazioId, itens, tipo) {
  const ul = document.getElementById(listaId);
  const vazio = document.getElementById(vazioId);

  ul.innerHTML = '';
  vazio.style.display = itens.length ? 'none' : 'block';

  itens.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="lancamento-info">
        <span class="lancamento-descricao">${escapeHtml(item.descricao)}</span>
      </div>
      <div style="display:flex;align-items:center;">
        <span class="lancamento-valor">${formatarReal(item.valor)}</span>
        <button class="btn-remover" title="Remover">&times;</button>
      </div>
    `;
    li.querySelector('.btn-remover').addEventListener('click', () => {
      removerItem(item.id, tipo);
    });
    ul.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Adicionar lançamento
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const descricao = document.getElementById('input-descricao').value.trim();
  const valor = parseFloat(document.getElementById('input-valor').value);
  const categoria = document.getElementById('input-categoria').value;

  if (!descricao || !valor || !categoria) return;

  const item = {
    id: crypto.randomUUID(),
    data: mesAtual,
    descricao,
    valor
  };

  if (categoria === 'investimento') {
    dados.investimentos.push(item);
  } else {
    item.categoria = categoria;
    dados.transacoes.push(item);
  }

  form.reset();
  renderizar();
});

// Remover
function removerItem(id, tipo) {
  if (tipo === 'transacoes') {
    dados.transacoes = dados.transacoes.filter(t => t.id !== id);
  } else {
    dados.investimentos = dados.investimentos.filter(i => i.id !== id);
  }
  renderizar();
}

// Exportar JSON
btnExportar.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Importar JSON
inputImportar.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const novos = JSON.parse(ev.target.result);
      if (novos.transacoes && novos.investimentos !== undefined) {
        dados = novos;
        receitaInput.value = dados.receita_mensal || '';
        renderizar();
      } else {
        alert('Arquivo JSON inválido. Verifique a estrutura.');
      }
    } catch {
      alert('Erro ao ler o arquivo JSON.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// Iniciar
init();

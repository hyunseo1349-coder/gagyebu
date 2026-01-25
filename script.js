// 1. 초기화 (2026년 기준)
let currentYear = 2026;
let currentMonth = 1;
let includeGiftCard = true;
let monthlyData = JSON.parse(localStorage.getItem('gagyebu_v2026')) || {};

// 2. 화면 렌더링
function render() {
  const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const data = monthlyData[key] || [];
  const listElement = document.getElementById('transactionList');
  
  document.getElementById('yearDisplay').textContent = `${currentYear}년`;
  document.getElementById('monthDisplay').textContent = `${currentMonth}월`;
  
  listElement.innerHTML = '';

  let total = 0, myShare = 0, gcTotal = 0;

  data.forEach(item => {
    if (!includeGiftCard && item.category === 'giftcard') return;

    total += item.amount;
    if (item.category === 'giftcard') gcTotal += item.amount;
    
    // 정산 로직: 1/N 체크 시 50%
    const currentMyShare = item.isSplit ? item.amount * 0.5 : item.amount;
    myShare += currentMyShare;

    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
      <div>
        <div class="item-title">
          <span class="tag tag-card">${item.card}</span>
          ${item.store}
        </div>
        <div class="item-meta">
          ${item.date} • ${getCatName(item.category)} ${item.isSplit ? ' • 1/N 정산' : ''}
        </div>
      </div>
      <div class="item-amount" style="color:${item.category === 'giftcard' ? '#0D9488' : '#111827'}">
        ${item.amount.toLocaleString()}원
      </div>
    `;
    listElement.appendChild(div);
  });

  document.getElementById('totalAmount').textContent = total.toLocaleString() + '원';
  document.getElementById('myAmount').textContent = myShare.toLocaleString() + '원';
  document.getElementById('giftcardAmount').textContent = gcTotal.toLocaleString() + '원';
}

// 3. 지출 저장
function submitTransaction() {
  const dateVal = document.getElementById('inputDate').value;
  const store = document.getElementById('inputStore').value;
  const amount = parseInt(document.getElementById('inputAmount').value);
  const card = document.getElementById('inputCard').value;
  const category = document.querySelector('input[name="cat"]:checked').value;
  const isSplit = document.getElementById('isSplit').checked;

  if (!dateVal || !store || isNaN(amount)) return alert('내용을 입력해주세요!');

  const d = new Date(dateVal);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const key = `${y}-${String(m).padStart(2, '0')}`;
  
  const newItem = {
    id: Date.now(),
    date: `${String(m).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
    store, amount, card, category, isSplit
  };

  if (!monthlyData[key]) monthlyData[key] = [];
  monthlyData[key].unshift(newItem);
  
  localStorage.setItem('gagyebu_v2026', JSON.stringify(monthlyData));
  
  // 입력한 연월로 이동
  currentYear = y;
  currentMonth = m;
  
  render();
  closeModal();
  resetForm();
}

// 4. 유틸리티
function getCatName(c) {
  const names = { food: '식비', shopping: '쇼핑', giftcard: '상품권', transport: '교통' };
  return names[c] || '기타';
}

function changeYear(offset) { currentYear += offset; render(); }
function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth > 12) { currentMonth = 1; currentYear++; }
  else if (currentMonth < 1) { currentMonth = 12; currentYear--; }
  render();
}

function toggleGiftcard() {
  includeGiftCard = !includeGiftCard;
  const btn = document.getElementById('gcFilterBtn');
  btn.classList.toggle('active', includeGiftCard);
  btn.textContent = includeGiftCard ? "상품권 포함" : "상품권 제외";
  render();
}

function resetForm() {
  document.getElementById('inputStore').value = '';
  document.getElementById('inputAmount').value = '';
  document.getElementById('isSplit').checked = false;
}

function openModal() { 
  document.getElementById('modalOverlay').classList.add('active'); 
  document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

// 시작
render();

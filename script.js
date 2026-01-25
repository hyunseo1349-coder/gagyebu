let currentYear = 2026;
let currentMonth = 1;
let includeGiftCard = true;
let selectedCard = "우리";
let selectedCategory = "food";

// 데이터 로드
let monthlyData = JSON.parse(localStorage.getItem('gagyebu_2026_data')) || {};

function render() {
  const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const data = monthlyData[key] || [];
  const listElement = document.getElementById('transactionList');
  
  document.getElementById('yearDisplay').textContent = `${currentYear}년`;
  document.getElementById('monthDisplay').textContent = `${currentMonth}월`;
  
  listElement.innerHTML = '';
  let total = 0, living = 0, myShare = 0, gcTotal = 0;

  data.forEach(item => {
    if (!includeGiftCard && item.category === 'giftcard') return;

    total += item.amount;
    if (item.category === 'giftcard') {
      gcTotal += item.amount;
    } else {
      living += item.amount;
    }
    
    // 정산 반영 계산 (1/N 체크 시 50%)
    const currentMyAmount = item.isSplit ? item.amount * 0.5 : item.amount;
    myShare += currentMyAmount;

    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
      <div>
        <div class="item-title"><span class="tag-card">${item.card}</span> ${item.store}</div>
        <div class="item-meta">${item.date} • ${getCatName(item.category)} ${item.isSplit ? ' • 1/N' : ''}</div>
      </div>
      <div class="item-amount" style="font-weight:700">
        ${item.amount.toLocaleString()}원
      </div>
    `;
    listElement.appendChild(div);
  });

  document.getElementById('totalAmount').textContent = total.toLocaleString() + '원';
  document.getElementById('livingAmount').textContent = living.toLocaleString() + '원';
  document.getElementById('myAmount').textContent = Math.floor(myShare).toLocaleString() + '원';
  document.getElementById('giftcardAmount').textContent = gcTotal.toLocaleString() + '원';
}

function selectCard(btn, name) {
  document.querySelectorAll('#cardSelector .select-item').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  selectedCard = name;
}

function selectCategory(btn, cat) {
  document.querySelectorAll('#categorySelector .select-item').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  selectedCategory = cat;
}

function submitTransaction() {
  const dateInput = document.getElementById('inputDate').value;
  const store = document.getElementById('inputStore').value.trim();
  const amount = parseInt(document.getElementById('inputAmount').value);
  const isSplit = document.getElementById('isSplit').checked;

  if (!dateInput || !store || isNaN(amount)) return alert('모두 입력해주세요!');

  const d = new Date(dateInput);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const key = `${y}-${String(m).padStart(2, '0')}`;
  
  const newItem = {
    id: Date.now(),
    date: `${String(m).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
    store, amount, card: selectedCard, category: selectedCategory, isSplit
  };

  if (!monthlyData[key]) monthlyData[key] = [];
  monthlyData[key].unshift(newItem);
  
  localStorage.setItem('gagyebu_2026_data', JSON.stringify(monthlyData));
  
  currentYear = y;
  currentMonth = m;
  render();
  closeModal();
  
  // 폼 초기화
  document.getElementById('inputStore').value = '';
  document.getElementById('inputAmount').value = '';
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
  btn.textContent = includeGiftCard ? "상품권 포함됨" : "상품권 제외됨";
  render();
}

function getCatName(c) {
  const names = { food: '식비', shopping: '쇼핑', giftcard: '상품권', transport: '교통' };
  return names[c] || '기타';
}

function calcMile() {
  const buy = parseFloat(document.getElementById('mileBuy').value);
  const sell = parseFloat(document.getElementById('mileSell').value);
  const point = parseFloat(document.getElementById('milePoint').value);
  if (buy && sell && point) {
    const res = (buy - sell) / point;
    document.getElementById('mileResult').innerHTML = `1마일당 <b>${res.toFixed(1)}원</b>`;
  }
}

function openModal() { 
  document.getElementById('modalOverlay').classList.add('active'); 
  document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }
function openMileModal() { document.getElementById('mileModal').classList.add('active'); }
function closeMileModal() { document.getElementById('mileModal').classList.remove('active'); }

render();

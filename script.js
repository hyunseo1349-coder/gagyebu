// 1. 초기 데이터 설정 (localStorage 활용)
let monthlyData = JSON.parse(localStorage.getItem('smartLedgerData')) || {};
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let includeGiftCard = true;

// 2. 화면 초기화 및 렌더링 함수
function render() {
  const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const data = monthlyData[key] || [];
  const listElement = document.getElementById('transactionList');
  
  document.getElementById('monthDisplay').textContent = `${currentYear}년 ${currentMonth}월`;
  listElement.innerHTML = '';

  let total = 0;      // 총 지출
  let living = 0;     // 실제 생활비
  let myShare = 0;    // 내 실제 부담
  let gcTotal = 0;    // 상품권 총액

  data.forEach(item => {
    // 상품권 포함 여부 토글 로직
    if (!includeGiftCard && item.category === 'giftcard') return;

    total += item.amount;
    if (item.category === 'giftcard') gcTotal += item.amount;
    else living += item.amount;
    
    // 내 부담금 (정산 기능 확장 전까지는 전체 금액을 내 부담으로 처리)
    myShare += item.amount;

    // 리스트 아이템 생성
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
      <div>
        <div class="store-name">${item.store}</div>
        <div style="font-size: 12px; color: #9CA3AF;">${item.date} • ${getCategoryName(item.category)}</div>
      </div>
      <div class="amount ${item.category === 'giftcard' ? 'giftcard' : ''}">
        ${item.amount.toLocaleString()}원
      </div>
    `;
    listElement.appendChild(div);
  });

  // 요약 정보 업데이트
  document.getElementById('totalAmount').textContent = total.toLocaleString() + '원';
  document.getElementById('livingAmount').textContent = living.toLocaleString() + '원';
  document.getElementById('myAmount').textContent = myShare.toLocaleString() + '원';
  document.getElementById('giftcardAmount').textContent = gcTotal.toLocaleString() + '원';
}

// 3. 지출 내역 저장 함수
function submitTransaction() {
  const dateInput = document.getElementById('inputDate').value;
  const store = document.getElementById('inputStore').value;
  const amount = parseInt(document.getElementById('inputAmount').value);
  const category = document.getElementById('inputCategory').value;

  if (!dateInput || !store || isNaN(amount)) {
    alert('내용을 모두 입력해주세요!');
    return;
  }

  const dateObj = new Date(dateInput);
  const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
  
  const newItem = {
    id: Date.now(),
    date: `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`,
    store,
    amount,
    category
  };

  if (!monthlyData[key]) monthlyData[key] = [];
  monthlyData[key].unshift(newItem); // 최신순으로 정렬

  localStorage.setItem('smartLedgerData', JSON.stringify(monthlyData));
  render();
  closeModal();
  
  // 입력 폼 리셋
  document.getElementById('inputStore').value = '';
  document.getElementById('inputAmount').value = '';
}

// 4. 유틸리티 함수들
function getCategoryName(cat) {
  const names = { food: '식비', shopping: '쇼핑', giftcard: '상품권', transport: '교통', etc: '기타' };
  return names[cat] || '기타';
}

function toggleGiftcard() {
  includeGiftCard = !includeGiftCard;
  document.getElementById('gcToggle').classList.toggle('off', !includeGiftCard);
  render();
}

function openModal() {
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// 5. 초기 실행
render();

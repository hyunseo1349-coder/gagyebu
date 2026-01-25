// [1] 초기 설정 및 데이터 불러오기
let currentYear = 2026;
let currentMonth = 1;
let includeGiftCard = true;

// 로컬 스토리지에서 데이터를 가져옵니다 (데이터 키: 'smart_ledger_2026_v1')
let monthlyData = JSON.parse(localStorage.getItem('smart_ledger_2026_v1')) || {};

// [2] 화면 그리기 함수 (Render)
function render() {
  const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const data = monthlyData[key] || [];
  const listElement = document.getElementById('transactionList');
  
  // 헤더 날짜 업데이트
  document.getElementById('yearDisplay').textContent = `${currentYear}년`;
  document.getElementById('monthDisplay').textContent = `${currentMonth}월`;
  
  listElement.innerHTML = ''; // 리스트 초기화

  let total = 0, myShare = 0, gcTotal = 0;

  // 데이터 반복 처리
  data.forEach(item => {
    // 상품권 제외 필터링
    if (!includeGiftCard && item.category === 'giftcard') return;

    total += item.amount;
    if (item.category === 'giftcard') gcTotal += item.amount;
    
    // 정산(1/N) 반영 계산
    const itemMyShare = item.isSplit ? item.amount * 0.5 : item.amount;
    myShare += itemMyShare;

    // 리스트 아이템 추가
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
      <div class="item-info">
        <div>${item.store}</div>
        <div>${item.date} ${item.isSplit ? ' • 1/N 정산 적용' : ''}</div>
      </div>
      <div class="item-amount" style="color:${item.category === 'giftcard' ? '#0D9488' : '#1F2937'}">
        ${item.amount.toLocaleString()}원
      </div>
    `;
    listElement.appendChild(div);
  });

  // 요약 카드 숫자 업데이트
  document.getElementById('totalAmount').textContent = total.toLocaleString() + '원';
  document.getElementById('myAmount').textContent = myShare.toLocaleString() + '원';
  document.getElementById('giftcardAmount').textContent = gcTotal.toLocaleString() + '원';
}

// [3] 연도 및 월 이동 기능
function changeYear(offset) {
  currentYear += offset;
  render();
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth > 12) { 
    currentMonth = 1; currentYear++; 
  } else if (currentMonth < 1) { 
    currentMonth = 12; currentYear--; 
  }
  render();
}

// [4] 새 지출 내역 저장
function submitTransaction() {
  const dateInput = document.getElementById('inputDate').value;
  const store = document.getElementById('inputStore').value;
  const amount = parseInt(document.getElementById('inputAmount').value);
  const category = document.getElementById('inputCategory').value;
  const isSplit = document.getElementById('isSplit').checked;

  if (!dateInput || !store || isNaN(amount)) {
    alert('모든 내용을 정확히 입력해주세요!');
    return;
  }

  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const key = `${year}-${String(month).padStart(2, '0')}`;
  
  const newItem = {
    id: Date.now(),
    date: `${String(month).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
    store, amount, category, isSplit
  };

  // 데이터 저장 구조 생성
  if (!monthlyData[key]) monthlyData[key] = [];
  monthlyData[key].unshift(newItem); // 최신 내역이 위로 오게 추가
  
  // 로컬 스토리지에 저장
  localStorage.setItem('smart_ledger_2026_v1', JSON.stringify(monthlyData));
  
  // 입력한 연도/월로 이동하여 즉시 결과 확인
  currentYear = year;
  currentMonth = month;
  
  render();
  closeModal();
  
  // 입력 폼 비우기
  document.getElementById('inputStore').value = '';
  document.getElementById('inputAmount').value = '';
  document.getElementById('isSplit').checked = false;
}

// [5] 마일리지 계산기 로직
function calcMile() {
  const buy = parseFloat(document.getElementById('mileBuy').value);
  const sell = parseFloat(document.getElementById('mileSell').value);
  const point = parseFloat(document.getElementById('milePoint').value);
  
  if (buy && sell && point) {
    const cost = buy - sell;
    const perMile = cost / point;
    const resultDiv = document.getElementById('mileResult');
    resultDiv.innerHTML = `실질 비용: ${cost}원<br>1마일당 <span style="font-size:20px;">${perMile.toFixed(2)}원</span>`;
  } else {
    alert('모든 수치를 입력해주세요.');
  }
}

// [6] 모달 및 필터 제어
function openModal() { document.getElementById('modalOverlay').classList.add('active'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }
function openMileModal() { document.getElementById('mileModal').classList.add('active'); }
function closeMileModal() { document.getElementById('mileModal').classList.remove('active'); }

function toggleGiftcard() {
  includeGiftCard = !includeGiftCard;
  const btn = document.getElementById('gcFilterBtn');
  btn.textContent = includeGiftCard ? "상품권 포함됨" : "상품권 제외됨";
  render();
}

// 시작 시 오늘 날짜 세팅 및 화면 렌더링
document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
render();

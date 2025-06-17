import { premiumTableBase, premiumTable, premiumTable100 } from './premiumTables.js';

const getAgeRange = (age) => {
  const ageNum = parseInt(age, 10);
  const ranges = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
  return ranges.find(start => ageNum >= start && ageNum <= start + 4) ? `${Math.floor(ageNum / 5) * 5}-${Math.floor(ageNum / 5) * 5 + 4}` : null;
};

const getSpecialBenefit = (age) => {
  const ageNum = parseInt(age, 10);
  if (ageNum <= 44) return '20万円';
  if (ageNum <= 49) return '10万円';
  return ageNum >= 60 ? '5万円' : '10万円';
};

const updateAmountOptions = (age) => {
  const select = document.querySelector('#amountSelect');
  const currentValue = select.value;
  select.innerHTML = '';
  const ageNum = parseInt(age, 10);
  if (ageNum >= 20 && ageNum <= 49) {
    select.innerHTML = '<option value="10000">1万円</option>';
  } else if (ageNum >= 50 && ageNum <= 59) {
    select.innerHTML = '<option value="5000">5千円</option><option value="10000">1万円</option>';
  } else if (ageNum >= 60 && ageNum <= 69) {
    select.innerHTML = '<option value="5000">5千円</option>';
  }
  if ([...select.options].some(opt => opt.value === currentValue)) {
    select.value = currentValue;
  }
};

const updateSimulationResult = ({ age, gender, amount, cancerAmount }) => {
  const ageRange = getAgeRange(age);
  let table;
  
  // がん特約の選択状態を確認
  const checkWrapper = document.querySelector('.l-result__check-wrapper');
  const cancerBlock = document.getElementById('cancerBlock');
  const isCancerSelected = checkWrapper.classList.contains('l-result__check--active') && cancerBlock.classList.contains('l-result__cancer--visible');

  // がん特約の選択状態に応じてテーブルを選択
  if (!isCancerSelected) {
    table = premiumTableBase;
  } else {
    table = cancerAmount === '100' ? premiumTable100 : premiumTable;
  }

  const premium = table?.[gender]?.[ageRange]?.[amount];
  const specialBenefit = getSpecialBenefit(age);

  if (premium !== undefined) {
    document.querySelector('#premiumAmount').textContent = premium.toLocaleString();
    document.querySelector('#resultBlock').classList.remove('l-result--hidden');

    const specialBenefitEl = document.querySelector('#specialBenefit');
    if (specialBenefitEl) specialBenefitEl.textContent = specialBenefit;

    const submitBtn = document.querySelector('.l-simulation__submit');
    if (submitBtn) submitBtn.textContent = '再計算する';
  }
};

const validateForm = () => {
  const age = document.querySelector('#ageSelect').value;
  const gender = document.querySelector("input[name='gender']:checked")?.value;
  const amount = document.querySelector('#amountSelect').value;

  if (!age) {
    alert('年齢を選択してください。');
    return false;
  }

  if (!gender) {
    alert('性別を選択してください。');
    return false;
  }

  if (!amount) {
    alert('給付金額を選択してください。');
    return false;
  }

  return true;
};

const form = document.querySelector('.l-simulation');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const loadingScreen = document.querySelector('.l-loading');
  loadingScreen.classList.remove('l-loading--hidden');

  const resultElement = document.querySelector('#resultBlock');
  resultElement.classList.remove('l-result--hidden');

  const headerHeight = document.querySelector('.l-header').offsetHeight;
  const scrollPosition = resultElement.offsetTop - headerHeight;
  window.scrollTo({
    top: scrollPosition,
    behavior: 'smooth'
  });

  const age = form.querySelector('#ageSelect').value;
  const gender = form.querySelector("input[name='gender']:checked").value;
  const amount = parseInt(document.querySelector('#amountSelect').value, 10);
  const cancerAmount = document.querySelector('#cancerAmountSelect')?.value || '50';

  updateSimulationResult({ age, gender, amount, cancerAmount });

  setTimeout(() => {
    loadingScreen.classList.add('l-loading--hidden');
  }, 1000);
});

document.querySelector('#ageSelect').addEventListener('change', (e) => {
  updateAmountOptions(e.target.value);
});

// チェックアイコンのトグル機能
const checkIconWrapper = document.querySelector('.l-result__check-wrapper');
const cancerBlock = document.getElementById('cancerBlock');

if (checkIconWrapper && cancerBlock) {
  checkIconWrapper.addEventListener('click', () => {
    checkIconWrapper.classList.toggle('l-result__check--active');
    cancerBlock.classList.toggle('l-result__cancer--visible');
  });
}

// モーダル制御
class ModalController {
  constructor() {
    this.overlay = document.querySelector('.l-modal-overlay');
    this.closeButton = document.querySelector('.l-modal__close');
    this.modalItems = document.querySelectorAll('.l-modal__item');
    this.isOpen = false;
    
    this.init();
  }

  init() {
    // 保証内容クリックイベント
    document.querySelectorAll('.l-guarantee__contents-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetModalId = this.getTargetModalId(item);
        if (targetModalId) {
          this.showModal(targetModalId);
        }
      });
    });

    // 閉じるボタンクリックイベント
    this.closeButton.addEventListener('click', () => this.hideModal());

    // オーバーレイクリックイベント
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hideModal();
      }
    });

    // ESCキーイベント
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hideModal();
      }
    });
  }

  getTargetModalId(item) {
    // data属性からモーダルIDを取得
    const type = item.getAttribute('data-modal-type');
    switch (type) {
      case 'hospitalization':
        return 'hospitalizationBenefitModal';
      case 'oneTimeHospitalization':
        return 'oneTimeHospitalizationModal';
      case 'commuting':
        return 'commutingModal';
      case 'advance':
        return 'advanceModal';
      case 'cancer':
        return 'cancerModal';
      default:
        return null;
    }
  }

  showModal(modalId) {
    // すべてのモーダルを非表示
    this.modalItems.forEach(modal => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });

    // 指定されたモーダルを表示
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      this.overlay.style.display = 'grid';
      targetModal.style.display = 'block';
      targetModal.setAttribute('aria-hidden', 'false');
      this.isOpen = true;
    }
  }

  hideModal() {
    this.overlay.style.display = 'none';
    this.modalItems.forEach(modal => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
    this.isOpen = false;
    document.body.style.overflow = '';
  }
}

// モーダルコントローラーの初期化
document.addEventListener('DOMContentLoaded', () => {
  new ModalController();
});

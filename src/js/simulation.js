import { premiumTables } from './premiumTables.js';

const getAgeRange = (age) => {
  const ageNum = parseInt(age, 10);
  const ranges = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
  return ranges.find((start) => ageNum >= start && ageNum <= start + 4) ? `${Math.floor(ageNum / 5) * 5}-${Math.floor(ageNum / 5) * 5 + 4}` : null;
};

const getSpecialBenefit = (age, gender) => {
  const ageNum = parseInt(age, 10);
  
  if (gender === 'male') {
    // 男性のデフォルト値
    if (ageNum >= 20 && ageNum <= 29) {
      return '200000'; // 20万円
    } else if (ageNum >= 30 && ageNum <= 34) {
      return '100000'; // 10万円
    } else if (ageNum >= 50 && ageNum <= 54) {
      return '100000'; // 10万円
    } else {
      return '50000'; // 5万円（35~49歳、55歳以上）
    }
  } else if (gender === 'female') {
    // 女性のデフォルト値
    if (ageNum >= 20 && ageNum <= 24) {
      return '200000'; // 20万円
    } else if (ageNum >= 50 && ageNum <= 54) {
      return '150000'; // 15万円
    } else if (ageNum >= 55 && ageNum <= 59) {
      return '100000'; // 10万円
    } else {
      return '50000'; // 5万円（25~49歳、60歳以上）
    }
  }
  
  // フォールバック
  return '100000';
};

const updateSpecialBenefitOptions = (age, gender) => {
  const select = document.querySelector('#specialBenefitSelect');
  if (!select) return;
  
  const ageNum = parseInt(age, 10);
  
  // 年齢と性別に応じた選択肢の制限
  let shouldLimitTo200000 = false;
  
  if (gender === 'male' && ageNum >= 20 && ageNum <= 29) {
    shouldLimitTo200000 = true;
  } else if (gender === 'female' && ageNum >= 20 && ageNum <= 24) {
    shouldLimitTo200000 = true;
  }
  
  if (shouldLimitTo200000) {
    // 20万円の選択肢のみ
    select.innerHTML = '<option value="200000">20万円</option>';
    select.value = '200000';
  } else {
    // 通常通り4択
    select.innerHTML = `
      <option value="50000">5万円</option>
      <option value="100000">10万円</option>
      <option value="150000">15万円</option>
      <option value="200000">20万円</option>
    `;
    
    // デフォルト値を設定（年齢や性別変更時は常にデフォルト値を適用）
    const defaultValue = getSpecialBenefit(age, gender);
    select.value = defaultValue;
  }
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
  if ([...select.options].some((opt) => opt.value === currentValue)) {
    select.value = currentValue;
  }
};

const updateSimulationResult = ({ age, gender, amount, cancerAmount, specialBenefit }) => {
  const ageRange = getAgeRange(age);

  // がん特約の選択状態を確認
  const checkWrapper = document.querySelector('.l-result__check-wrapper');
  const cancerBlock = document.getElementById('cancerBlock');
  const isCancerSelected = checkWrapper.classList.contains('l-result__check--active') && cancerBlock.classList.contains('l-result__cancer--visible');

  // 入院一時金とがん特約の組み合わせに応じてテーブルを選択
  let cancerType = 'base';
  if (isCancerSelected) {
    cancerType = cancerAmount === '100' ? 'cancer100' : 'cancer50';
  }

  const table = premiumTables[specialBenefit]?.[cancerType];
  const premium = table?.[gender]?.[ageRange]?.[amount];

  if (premium !== undefined) {
    document.querySelector('#premiumAmount').textContent = premium.toLocaleString();
    document.querySelector('#resultBlock').classList.remove('l-result--hidden');

    // 年齢と性別に応じた選択肢を更新し、現在の値を保持
    const specialBenefitSelect = document.querySelector('#specialBenefitSelect');
    if (specialBenefitSelect) {
      const currentValue = specialBenefit;
      updateSpecialBenefitOptions(age, gender);
      
      // 現在選択されている値が有効な選択肢の場合は保持
      if ([...specialBenefitSelect.options].some(opt => opt.value === currentValue)) {
        specialBenefitSelect.value = currentValue;
      }
    }

    const submitBtn = document.querySelector('.l-simulation__submit');
    if (submitBtn) {
      submitBtn.textContent = '再計算する';
    }
  } else {
    // テーブルデータが見つからない場合の処理
    console.warn('保険料テーブルが見つかりません:', {
      specialBenefit,
      cancerType,
      gender,
      ageRange,
      amount,
      tableExists: !!table,
      tableKeys: table ? Object.keys(table) : 'table is undefined'
    });
    
    // エラー表示またはデフォルト動作
    document.querySelector('#premiumAmount').textContent = '計算できません';
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

  if (!validateForm()) {
    return;
  }

  const loadingScreen = document.querySelector('.l-loading');
  loadingScreen.classList.remove('l-loading--hidden');

  const resultElement = document.querySelector('#resultBlock');
  resultElement.classList.remove('l-result--hidden');

  const headerHeight = document.querySelector('.c-header').offsetHeight;
  const scrollPosition = resultElement.offsetTop - headerHeight;
  window.scrollTo({
    top: scrollPosition,
    behavior: 'smooth',
  });

  const age = form.querySelector('#ageSelect').value;
  const gender = form.querySelector("input[name='gender']:checked").value;
  const amount = parseInt(document.querySelector('#amountSelect').value, 10);
  const cancerAmount = document.querySelector('#cancerAmountSelect')?.value || '50';
  const specialBenefit = document.querySelector('#specialBenefitSelect')?.value || '100000';

  updateSimulationResult({ age, gender, amount, cancerAmount, specialBenefit });

  setTimeout(() => {
    loadingScreen.classList.add('l-loading--hidden');
  }, 1000);
});

document.querySelector('#ageSelect').addEventListener('change', (e) => {
  updateAmountOptions(e.target.value);
  const gender = document.querySelector("input[name='gender']:checked")?.value;
  if (gender) {
    updateSpecialBenefitOptions(e.target.value, gender);
  }
});

// 性別の変更イベントリスナー
document.querySelectorAll("input[name='gender']").forEach(input => {
  input.addEventListener('change', (e) => {
    const age = document.querySelector('#ageSelect').value;
    if (age) {
      updateSpecialBenefitOptions(age, e.target.value);
    }
  });
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
    document.querySelectorAll('.l-guarantee__contents-item').forEach((item) => {
      item.addEventListener('click', () => {
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
    this.modalItems.forEach((modal) => {
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
    this.modalItems.forEach((modal) => {
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

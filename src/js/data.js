/**
 * セクションの開閉機能を制御
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggleSection = (section) => {
    const wrapper = section.querySelector('.l-data-block-wrapper');
    const heading = section.querySelector('.l-section__heading--closable');
    const button = section.querySelector('.l-section__close-button');

    if (wrapper && heading && button) {
      wrapper.classList.toggle('l-data-block-wrapper--opened');
      button.classList.toggle('l-section__close-button--opened');
      heading.classList.toggle('l-section__heading--opened');
    }
  };

  // 閉じるボタンクリック時の処理
  const closeButtons = document.querySelectorAll('.l-section__close-button');
  closeButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const section = button.closest('.l-section');
      if (section) {
        toggleSection(section);
      }
    });
  });

  const closableHeadings = document.querySelectorAll('.l-section__heading--closable');
  closableHeadings.forEach((heading) => {
    heading.addEventListener('click', () => {
      const section = heading.closest('.l-section');
      if (section) {
        toggleSection(section);
      }
    });
  });
});

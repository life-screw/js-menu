export function megaMenuAnimation() {
  // メガメニューの構造を作成=================
  // ハンバーガーメニューmenuItems内のHTMLをコピーし、
  // 新たに生成したmegaMenuWrapの中に複製する。
  document.addEventListener("DOMContentLoaded", function () {
    const menuItems = document.querySelectorAll(
      ".l-humnav-main__list--has-sub",
    );

    menuItems.forEach((menuItem) => {
      // 768px以上でのみメガメニューを機能させる
      const showMegaMenu = () => {
        if (window.innerWidth >= 768) {
          // タイトルテキストを取得
          const titleElement = menuItem.querySelector("a, .a-tag");
          const titleText = titleElement?.textContent?.trim();

          // サブメニューを取得
          const subMenu = menuItem.querySelector(".l-humnav-sub");

          if (titleText && subMenu) {
            // 既存のメガメニューを削除（重複防止）
            const existingWrap = menuItem.querySelector(".l-humnav-sub-wrap");
            if (existingWrap) {
              existingWrap.remove();
            }

            // メガメニューを新たに作成
            const megaMenuWrap = document.createElement("div");
            megaMenuWrap.className = "l-humnav-sub-wrap";

            const megaMenuInner = document.createElement("div");
            megaMenuInner.className = "l-humnav-sub-wrap__inner";

            // タイトルを新たに作成
            const titleWrapped = document.createElement("div");
            titleWrapped.className = "l-humnav-sub-wrap__title";
            titleWrapped.textContent = titleText;

            // サブメニューをクローン
            const subMenuClone = subMenu.cloneNode(true);
            subMenuClone.classList.remove("js-accordion-contents-sp");

            // メガメニューに要素を追加
            megaMenuInner.appendChild(titleWrapped);
            megaMenuInner.appendChild(subMenuClone);
            megaMenuWrap.appendChild(megaMenuInner);

            // menuItemに追加
            menuItem.appendChild(megaMenuWrap);
          }
        }
      };

      // メガメニューを初期化（ホバー制御はCSSで行う）
      showMegaMenu();
    });
  });

  // メガメニューのホバーアクション==================
  const setupMenuHover = (selector) => {
    document.querySelectorAll(selector).forEach((item) => {
      item.addEventListener("mouseenter", function () {
        this.classList.add("is_active");
        const mega = this.querySelector(".l-humnav-sub-wrap");
        if (mega) mega.style.display = "block";
      });

      item.addEventListener("mouseleave", function () {
        this.classList.remove("is_active");
        const mega = this.querySelector(".l-humnav-sub-wrap");
        if (mega)
          setTimeout(() => {
            mega.style.display = "none";
          }, 500); // ホバーアウト後に少し遅れて非表示にする（フェードアウトの時間に合わせる）
      });
    });
  };

  // メインメニューとサブメニューの両方にホバーイベントを設定
  // これにより、サブメニュー内を移動してもホバー状態が維持される
  setupMenuHover(".l-humnav-main__list--has-sub");
  setupMenuHover(".l-humnav-sub-wrap");
}

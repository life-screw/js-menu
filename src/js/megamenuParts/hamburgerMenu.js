export function hamburgerMenu() {
  // ハンバーガーメニューの処理を開始===========
  document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".js-hum");
    const navigation = document.querySelector(".js-humnav");
    const overlay = document.querySelector(".js-overlay");

    const updateTabIndex = () => {
      const windowWidth = window.innerWidth;
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      const links = navigation.querySelectorAll("a");
      links.forEach((link) => {
        // //🟢ハンバーガーのメニューをPC時にメニューに使う時は、ここを表示
        // if (windowWidth >= 768) {
        //   link.removeAttribute("tabindex"); //PC時はtabindex="-1"を削除
        // } else {
        //   link.setAttribute("tabindex", expanded ? "0" : "-1");
        // }

        //🟢ハンバーガーのメニューをPC時にメニューに使わない時は、ここを表示
        link.removeAttribute("tabindex");
      });
    };

    // ハンバーガーメニューのクリックイベント
    hamburger.addEventListener("click", function () {
      // 現在の状態を取得
      const expanded = this.getAttribute("aria-expanded") === "true";

      // 新しい状態（反転させる）
      const newState = !expanded;

      // 状態を更新
      this.setAttribute("aria-expanded", newState);
      navigation.setAttribute("aria-hidden", !newState);

      // メニューとナビゲーションの状態をトグル
      this.classList.toggle("is-active");
      navigation.classList.toggle("is-active");
      overlay.classList.toggle("is-active");

      // ナビゲーション内のリンクのタブインデックスを更新
      updateTabIndex();
    });

    //🟢ハンバーガーのメニューをPC時にメニューに使わない時は、ここを非表示
    // window.addEventListener("resize", updateTabIndex);

    updateTabIndex();

    //ナビゲーション内のリンクがクリックされたときのイベント-------
    // navigation.querySelectorAll("a").forEach(function (link) {
    //   link.addEventListener("click", function () {
    //     // メニューとナビゲーションの状態を非アクティブに
    //     hamburger.setAttribute("aria-expanded", "false");
    //     navigation.setAttribute("aria-hidden", "true");
    //     hamburger.classList.remove("is-active");
    //     navigation.classList.remove("is-active");
    //     overlay.classList.remove("is-active");

    //     // ナビゲーション内のリンクのタブインデックスを更新
    //     const navLinks = navigation.querySelectorAll("a");
    //     navLinks.forEach((navLink) => {
    //       navLink.setAttribute("tabindex", "-1");
    //     });
    //   });
    // });
  });
}

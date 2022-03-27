// 即時関数
const indexModule = (() => {
  const path = window.location.pathname;

  switch (path) {
    case "/":
      // 検索ボタン・クリック
      document.getElementById("search-btn").addEventListener("click", () => {
        return searchModule.searchUsers();
      });
      // user.jsのfetchAllUsersを呼び出す
      return userModule.fetchAllUsers();

    case "/create.html":
      // 作成ボタン・クリック
      document.getElementById("save-btn").addEventListener("click", () => {
        return userModule.createUser();
      });
      break;

    case "/edit.html":
      // id取得
      const uid = window.location.search.split("?uid=")[1];

      // 編集ボタン・クリック
      document.getElementById("edit-btn").addEventListener("click", () => {
        return userModule.editUser(uid);
      });
      // 削除ボタン・クリック
      document.getElementById("delete-btn").addEventListener("click", () => {
        return userModule.deleteUser(uid);
      });
      // ユーザー情報表示
      return userModule.setExistValue(uid);

    default:
      break;
  }
})();

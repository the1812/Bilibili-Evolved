import { NavbarComponent } from '../custom-navbar-component';

export class Rank extends NavbarComponent {
  constructor() {
    super();
    this.href = 'https://www.bilibili.com/v/popular/rank/all';
    this.html = '排行';
    this.popupHtml = /*html*/ `
      <ul id="ranking-list">
        <li><a target="_blank" href="https://www.bilibili.com/v/popular/all">综合热门</a></li>
        <li><a target="_blank" href="https://www.bilibili.com/v/popular/weekly">每周必看</a></li>
        <li><a target="_blank" href="https://www.bilibili.com/v/popular/history">入站必刷</a></li>
        <li><a target="_blank" href="https://www.bilibili.com/v/popular/rank/all">排行榜</a></li>
      </ul>
    `;
  }
  get name(): keyof CustomNavbarOrders {
    return 'rankingLink';
  }
}
export default {
  export: {
    Rank,
  },
};

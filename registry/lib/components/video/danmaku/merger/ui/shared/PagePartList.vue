<template>
  <div class="dm-direct-details" style="padding: 10px 0">
    <div v-if="showPartMode" class="dm-part-mode-panel">
      <label class="dm-part-mode-toggle-row">
        <input
          type="checkbox"
          class="dm-part-mode-toggle"
          :checked="partModeEnabled"
          @change="onPartModeToggle"
        />
        <span style="font-size: 13px; font-weight: 600; color: var(--text1, #222)"
          >分P有效顺延</span
        >
        <span style="font-size: 11px; color: var(--text3, #999)">
          一集拆多P、尾部多为拼接素材时，按正片有效时长对齐弹幕
        </span>
      </label>
      <div class="dm-part-mode-fields" :style="{ display: partModeEnabled ? 'block' : 'none' }">
        <div style="display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center">
          <label
            style="
              font-size: 12px;
              color: var(--text2, #555);
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            本集有效时长
            <input
              type="text"
              class="dm-total-duration dm-part-duration-input"
              placeholder="24:00"
              title="本集正片有效内容总时长（非 B 站分P总时长），支持 mm:ss 或 hh:mm:ss"
              :value="totalDuration"
              @click.stop
              @input="onTotalDurationInput"
            />
          </label>
          <label
            style="
              font-size: 12px;
              color: var(--text2, #555);
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            每P有效时长
            <input
              type="text"
              class="dm-uniform-part-duration dm-part-duration-input"
              placeholder="7:00"
              title="各P有效内容等长时填写（如前三P各约7分钟）；最后一P通常更短，请在下方单独填"
              :value="uniformPartDuration"
              @click.stop
              @input="onUniformDurationInput"
            />
          </label>
          <button type="button" class="dm-part-calc-btn" @click.stop="onCalcOffsets">
            计算顺延
          </button>
          <button
            type="button"
            class="dm-part-select-all-btn"
            style="
              padding: 4px 12px;
              background: var(--bg1, #fff);
              color: var(--text2, #555);
              border: 1px solid var(--line_regular, #ccd0d7);
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            "
            @click.stop="onSelectAllPages"
          >
            全选分P
          </button>
        </div>
        <div
          class="dm-part-mode-hint"
          style="font-size: 11px; color: var(--text3, #999); margin-top: 8px; line-height: 1.6"
        >
          {{ partModeHintText }}
        </div>
      </div>
    </div>

    <div style="font-size: 12px; color: var(--text3, #999); margin-bottom: 8px">
      共 {{ sortedPages.length }} 个分P：
    </div>

    <div
      class="dm-page-list"
      :data-bvid="videoMeta.bvid"
      :data-title="videoMeta.title"
      :data-pic="videoMeta.pic"
      :data-author="videoMeta.author"
      style="
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--line_regular, #eee);
        border-radius: 4px;
        background: var(--bg1, #fff);
      "
    >
      <div
        v-for="page in sortedPages"
        :key="page.cid"
        class="dm-page-item"
        :data-cid="page.cid"
        :data-part="page.part"
        :data-page="page.page"
        style="
          padding: 10px;
          border-bottom: 1px solid var(--line_light, #eee);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
        "
        @click="onPageItemClick(page)"
      >
        <div class="dm-checkbox" :class="{ checked: !!page.selected }" style="flex-shrink: 0"></div>

        <div
          style="
            width: 120px;
            height: 75px;
            border-radius: 6px;
            overflow: hidden;
            background: #e7e7e7;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          "
        >
          <img
            :src="coverUrl"
            style="width: 100%; height: 100%; object-fit: cover"
            referrerpolicy="no-referrer"
          />
        </div>

        <div style="flex: 1; min-width: 0">
          <div
            style="
              font-size: 13px;
              font-weight: bold;
              color: var(--text1, #222);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
            :title="`P${page.page} ${page.part}`"
          >
            P{{ page.page }} - {{ page.part }}
          </div>
          <div
            style="
              font-size: 12px;
              color: var(--text2, #555);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-top: 2px;
            "
            :title="videoMeta.title"
          >
            {{ videoMeta.title }}
          </div>
          <div style="font-size: 12px; color: var(--text3, #999); margin-top: 2px">
            UP: {{ videoMeta.author || '未知' }}
            <span
              v-if="page.duration && page.duration > 0"
              class="dm-page-duration-badge"
              :data-cid="page.cid"
              style="margin-left: 8px; color: var(--text3, #999)"
            >
              · B站片长 {{ formatDurationShort(page.duration) }}
            </span>
            <span class="dm-count-badge" :data-cid="page.cid" :style="danmakuBadgeStyle(page)">
              {{ danmakuBadgeText(page) }}
            </span>
          </div>
          <div
            v-if="showOffsetPreview(page)"
            class="dm-part-offset-preview"
            style="font-size: 11px; color: #00aeec; margin-top: 3px"
          >
            {{ page.offsetPreview }}
          </div>
        </div>

        <div
          v-if="showPartDurationCell(page)"
          class="dm-part-duration-cell"
          style="display: flex; flex-shrink: 0; align-items: center; gap: 4px"
          @click.stop
        >
          <span style="font-size: 11px; color: var(--text3, #999)">有效时长</span>
          <input
            type="text"
            class="dm-part-duration-input"
            :data-page="page.page"
            :data-cid="page.cid"
            placeholder="7:00"
            title="该分P正片有效内容时长（不含尾部拼接素材），用于计入顺延"
            :value="page.partDurationText || ''"
            @input="onPageDurationInput(page, $event)"
          />
        </div>

        <div
          v-if="showOffsetControl(page)"
          class="dm-page-offset"
          style="
            margin-left: auto;
            display: flex;
            align-items: center;
            background: var(--bg2, #f4f5f7);
            border-radius: 4px;
            padding: 2px 6px;
          "
          @click.stop
        >
          <select
            class="dm-offset-type"
            style="
              background: transparent;
              border: none;
              color: var(--text2, #555);
              font-size: 12px;
              outline: none;
              cursor: pointer;
              margin-right: 4px;
            "
            :value="String(pageOffsetType(page))"
            @change="onOffsetTypeChange(page, $event)"
          >
            <option value="1">推迟</option>
            <option value="-1">提前</option>
          </select>
          <input
            type="number"
            step="0.5"
            min="0"
            class="dm-offset-input"
            :data-cid="page.cid"
            :value="pageOffsetValue(page)"
            style="
              width: 40px;
              background: transparent;
              border: none;
              border-bottom: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: var(--text1, #222);
              outline: none;
            "
            @input="onOffsetValueChange(page, $event)"
          />
          <span style="font-size: 12px; color: var(--text3, #999); margin-left: 2px">秒</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { MergerOffsetType, PagePartListRow } from '../contracts'

/** 视频元信息（搜索展开分 P 区 data-* 与展示用） */
export interface MergerVideoMeta {
  bvid: string
  title: string
  pic: string
  author: string
}

const DEFAULT_PART_MODE_HINT =
  '例：24 分钟一集拆 4P，前三 P 各约 7 分钟有效内容，P4 不足 7 分钟请在下方单独填写。P1 顺延 0 秒，P2 顺延 P1 有效时长，依此类推。旁注「B站片长」仅供对照，不计入顺延。'

export default Vue.extend({
  name: 'PagePartList',
  props: {
    pages: {
      type: Array as () => PagePartListRow[],
      required: true,
    },
    videoMeta: {
      type: Object as () => MergerVideoMeta,
      required: true,
    },
    partModeEnabled: {
      type: Boolean,
      default: false,
    },
    totalDuration: {
      type: String,
      default: '',
    },
    uniformPartDuration: {
      type: String,
      default: '',
    },
    showPartMode: {
      type: Boolean,
      default: false,
    },
    /** 顺延面板底部提示；未传时使用默认说明文案 */
    partModeHint: {
      type: String,
      default: '',
    },
  },
  computed: {
    sortedPages(): PagePartListRow[] {
      return [...this.pages].sort((a, b) => a.page - b.page)
    },
    coverUrl(): string {
      const pic = this.videoMeta.pic || ''
      return pic.startsWith('//') ? `https:${pic}` : pic
    },
    partModeHintText(): string {
      return this.partModeHint || DEFAULT_PART_MODE_HINT
    },
  },
  methods: {
    formatDurationShort(seconds: number): string {
      const sec = Math.max(0, Math.round(seconds * 10) / 10)
      const h = Math.floor(sec / 3600)
      const m = Math.floor((sec % 3600) / 60)
      const s = Math.round(sec % 60)
      if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      }
      return `${m}:${String(s).padStart(2, '0')}`
    },
    pageOffsetType(page: PagePartListRow): MergerOffsetType {
      return page.offsetType === -1 ? -1 : 1
    },
    pageOffsetValue(page: PagePartListRow): number {
      return page.offset ?? 0
    },
    showOffsetControl(page: PagePartListRow): boolean {
      return !this.partModeEnabled || !!page.selected
    },
    showPartDurationCell(page: PagePartListRow): boolean {
      return this.partModeEnabled && !!page.selected
    },
    showOffsetPreview(page: PagePartListRow): boolean {
      return this.partModeEnabled && !!page.selected && !!page.offsetPreview
    },
    danmakuBadgeText(page: PagePartListRow): string {
      if (page.danmakuError) {
        return '· 获取失败'
      }
      if (page.danmakuCount === undefined) {
        return '· 弹幕加载中...'
      }
      return `· ${page.danmakuCount} 条弹幕`
    },
    danmakuBadgeStyle(page: PagePartListRow): Record<string, string> {
      const base = {
        marginLeft: '8px',
        fontWeight: '500',
      }
      if (page.danmakuError) {
        return { ...base, color: '#ff6b6b' }
      }
      return { ...base, color: '#00AEEC' }
    },
    onPartModeToggle(event: Event) {
      const { checked } = event.target as HTMLInputElement
      this.$emit('update:partModeEnabled', checked)
    },
    onPageItemClick(page: PagePartListRow) {
      this.$emit('update:pageSelection', {
        bvid: this.videoMeta.bvid,
        cid: page.cid,
        selected: !page.selected,
      })
    },
    onOffsetTypeChange(page: PagePartListRow, event: Event) {
      const raw = (event.target as HTMLSelectElement).value
      const offsetType = (raw === '-1' ? -1 : 1) as MergerOffsetType
      this.$emit('update:offset', {
        bvid: this.videoMeta.bvid,
        cid: page.cid,
        offset: this.pageOffsetValue(page),
        offsetType,
      })
    },
    onOffsetValueChange(page: PagePartListRow, event: Event) {
      const raw = (event.target as HTMLInputElement).value
      const offset = Math.max(0, parseFloat(raw) || 0)
      this.$emit('update:offset', {
        bvid: this.videoMeta.bvid,
        cid: page.cid,
        offset,
        offsetType: this.pageOffsetType(page),
      })
    },
    onCalcOffsets() {
      this.$emit('calc-offsets', { bvid: this.videoMeta.bvid })
    },
    onSelectAllPages() {
      this.$emit('select-all-pages', { bvid: this.videoMeta.bvid, select: true })
    },
    onTotalDurationInput(event: Event) {
      const { value } = event.target as HTMLInputElement
      this.$emit('part-duration-change', {
        bvid: this.videoMeta.bvid,
        field: 'total',
        value,
      })
    },
    onUniformDurationInput(event: Event) {
      const { value } = event.target as HTMLInputElement
      this.$emit('part-duration-change', {
        bvid: this.videoMeta.bvid,
        field: 'uniform',
        value,
      })
    },
    onPageDurationInput(page: PagePartListRow, event: Event) {
      const { value } = event.target as HTMLInputElement
      this.$emit('part-duration-change', {
        bvid: this.videoMeta.bvid,
        field: 'part',
        cid: page.cid,
        value,
      })
    },
  },
})
</script>

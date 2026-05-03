<template>
  <div class="rbvp-condition-editor" :class="[`depth-${depth}`, condition.matcherKind]">
    <div class="rbvp-condition-header">
      <div class="rbvp-condition-badge">
        {{ condition.matcherKind === 'logic' ? '逻辑组合' : '基础匹配' }}
      </div>
      <button
        v-if="allowRemove"
        type="button"
        class="rbvp-condition-remove"
        title="删除条件"
        @click="$emit('remove')"
      >
        删除
      </button>
    </div>

    <template v-if="condition.matcherKind === 'basic'">
      <div class="rbvp-condition-grid">
        <label class="rbvp-condition-field">
          <span class="rbvp-condition-label">规则类型</span>
          <select
            v-model="condition.matcherType"
            class="rbvp-condition-input"
            @change="handleMatcherTypeChange"
          >
            <option v-for="type in visualMatcherTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </label>
        <label v-if="condition.matcherType !== 'FINAL'" class="rbvp-condition-field">
          <span class="rbvp-condition-label">匹配参数</span>
          <select
            v-if="condition.matcherType === 'RULE-SET'"
            v-model="condition.matcherArgument"
            class="rbvp-condition-input"
          >
            <option v-if="ruleSetNames.length === 0" disabled value="">暂无可用规则集</option>
            <option v-for="name in ruleSetNames" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
          <input
            v-else
            v-model.trim="condition.matcherArgument"
            class="rbvp-condition-input"
            :placeholder="getMatcherArgumentPlaceholder(condition.matcherType)"
          />
        </label>
      </div>
      <div class="rbvp-condition-hint">{{ getMatcherTypeHint(condition.matcherType) }}</div>
    </template>

    <template v-else>
      <div class="rbvp-condition-grid">
        <label class="rbvp-condition-field">
          <span class="rbvp-condition-label">逻辑运算</span>
          <select v-model="condition.logicOperator" class="rbvp-condition-input">
            <option v-for="operator in logicMatcherTypes" :key="operator" :value="operator">
              {{ operator }}
            </option>
          </select>
        </label>
      </div>
      <div class="rbvp-condition-hint">{{ getLogicMatcherHint(condition.logicOperator) }}</div>
      <div class="rbvp-condition-children">
        <div v-if="condition.conditions.length === 0" class="rbvp-condition-empty">
          还没有子条件，请新增一个基础匹配或逻辑组合。
        </div>
        <RBVPLogicConditionEditor
          v-for="(child, index) in condition.conditions"
          :key="child.id"
          :condition="child"
          :default-matcher-arguments="defaultMatcherArguments"
          :rule-set-names="ruleSetNames"
          :visual-matcher-types="visualMatcherTypes"
          :logic-matcher-types="logicMatcherTypes"
          :depth="depth + 1"
          allow-remove
          @remove="removeChild(index)"
        />
        <div v-if="showInsertChooser" class="rbvp-condition-insert">
          <button type="button" class="rbvp-condition-choice" @click="addBasicChild">
            新增基础匹配
          </button>
          <button type="button" class="rbvp-condition-choice" @click="addLogicChild">
            新增逻辑组合
          </button>
          <button type="button" class="rbvp-condition-cancel" @click="showInsertChooser = false">
            取消
          </button>
        </div>
        <button
          type="button"
          class="rbvp-condition-add"
          @click="showInsertChooser = !showInsertChooser"
        >
          {{ showInsertChooser ? '收起新增入口' : '新增子条件' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
const createConditionId = () => `rbvp-condition-${Math.random().toString(36).slice(2, 10)}`
const createBasicCondition = (defaultMatcherArguments: Record<string, string>) => ({
  id: createConditionId(),
  matcherKind: 'basic',
  matcherType: 'UP',
  matcherArgument: defaultMatcherArguments.UP ?? '',
  logicOperator: 'AND',
  conditions: [],
})
const createLogicCondition = (defaultMatcherArguments: Record<string, string>) => ({
  id: createConditionId(),
  matcherKind: 'logic',
  matcherType: 'UP',
  matcherArgument: '',
  logicOperator: 'AND',
  conditions: [createBasicCondition(defaultMatcherArguments)],
})

export default Vue.extend({
  name: 'RBVPLogicConditionEditor',
  props: {
    condition: {
      type: Object,
      required: true,
    },
    visualMatcherTypes: {
      type: Array,
      required: true,
    },
    defaultMatcherArguments: {
      type: Object,
      default: () => ({}),
    },
    ruleSetNames: {
      type: Array,
      default: () => [],
    },
    logicMatcherTypes: {
      type: Array,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    allowRemove: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showInsertChooser: false,
    }
  },
  methods: {
    handleMatcherTypeChange() {
      this.condition.matcherArgument =
        this.defaultMatcherArguments[this.condition.matcherType] ?? ''
    },
    getMatcherArgumentPlaceholder(type: string) {
      switch (type) {
        case 'BVID':
          return '例如: BV1xx411c7mD 或 BV1xx411c7mD#2'
        case 'AID':
          return '例如: 170001 或 170001#2'
        case 'SECTION':
          return '例如: 123456'
        case 'SECTION-ROOT':
          return '例如: 654321'
        case 'SECTION-NAME':
          return '例如: 第 1 话'
        case 'SECTION-ROOT-NAME':
          return '例如: 某某合集'
        case 'UP':
          return '例如: 123456'
        case 'TAG':
          return '例如: 教程'
        case 'TAG-MUSIC':
          return '例如: MA12345'
        case 'PARTITION':
          return '例如: 17'
        case 'TITLE':
          return '例如: 速通'
        case 'PART':
          return '例如: P1'
        case 'TIME':
          return '例如: >600'
        case 'RULE-SET':
          return '例如: study-list'
        default:
          return '请输入匹配参数'
      }
    },
    getMatcherTypeHint(type: string) {
      switch (type) {
        case 'BVID':
          return '按视频 BVID 精确匹配，参数末尾可追加 #分P。'
        case 'AID':
          return '按视频 AID 精确匹配，参数末尾可追加 #分P。'
        case 'SECTION':
          return '按当前合集分区的 section id 精确匹配。适合对合集内某个分区单独配置策略。'
        case 'SECTION-ROOT':
          return '按当前合集根分组的 section root id 精确匹配。适合对整个合集统一配置策略。'
        case 'SECTION-NAME':
          return '按当前合集条目标题匹配，对应 ugc_season.sections[].episodes[].title。'
        case 'SECTION-ROOT-NAME':
          return '按当前合集标题匹配，对应 ugc_season.title。'
        case 'UP':
          return '按 UP 主匹配，参数通常填写 UP 的 UID。'
        case 'TAG':
          return '按视频标签文本匹配，参数填写标签关键字。'
        case 'TAG-MUSIC':
          return '按视频标签中的 music_id 匹配，参数填写 music_id 关键字（支持正则）。'
        case 'PARTITION':
          return '按视频分区 ID 精确匹配，参数填写 tid。'
        case 'TITLE':
          return '按视频标题匹配，参数填写标题关键字。'
        case 'PART':
          return '按分 P 标题匹配，参数填写分 P 名称或关键字。'
        case 'TIME':
          return '按时长匹配，参数填写时间条件，建议先确认语法。'
        case 'RULE-SET':
          return '引用本地规则集，参数填写规则集名称。'
        case 'FINAL':
          return '兜底规则，不需要匹配参数。'
        default:
          return '请选择合适的规则类型。'
      }
    },
    getLogicMatcherHint(operator: string) {
      switch (operator) {
        case 'AND':
          return '逻辑与：所有子条件都命中时才生效。'
        case 'OR':
          return '逻辑或：任意一个子条件命中时即可生效。'
        case 'NOT':
          return '逻辑非：仅接受一个子条件，当该条件不命中时生效。'
        default:
          return '请配置逻辑组合条件。'
      }
    },
    addBasicChild() {
      this.condition.conditions.push(createBasicCondition(this.defaultMatcherArguments))
      this.showInsertChooser = false
    },
    addLogicChild() {
      this.condition.conditions.push(createLogicCondition(this.defaultMatcherArguments))
      this.showInsertChooser = false
    },
    removeChild(index: number) {
      this.condition.conditions.splice(index, 1)
    },
  },
})
</script>

<style lang="scss">
@import 'shared';

.rbvp-condition-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #8883;
  border-radius: 8px;
  background-color: rgb(127 127 127 / 6%);
}

.rbvp-condition-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.rbvp-condition-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background-color: var(--theme-color-10);
  color: var(--theme-color);
  font-size: 12px;
  font-weight: 600;
}

.rbvp-condition-remove,
.rbvp-condition-add,
.rbvp-condition-choice,
.rbvp-condition-cancel {
  @extend %rbvp-btn-pill;
}

.rbvp-condition-remove:hover {
  color: #d14343;
}

.rbvp-condition-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.rbvp-condition-field {
  @extend %rbvp-form-field;
}

.rbvp-condition-label {
  font-size: 12px;
  font-weight: 600;
}

.rbvp-condition-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #8884;
  border-radius: 6px;
  background-color: rgb(255 255 255 / 72%);
  color: inherit;
  padding: 8px 10px;
  font: inherit;

  @extend %rbvp-dark-input-bg;
}

.rbvp-condition-hint,
.rbvp-condition-empty {
  @extend %rbvp-hint-text;
}

.rbvp-condition-children {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rbvp-condition-insert {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 900px) {
  .rbvp-condition-grid {
    grid-template-columns: 1fr;
  }
}
</style>

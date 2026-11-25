export enum Preset {
  Standard = '标准',
  Minimal = '极简',
  Data = '数据',
  Markdown = 'Markdown',
  Link = '纯链接',
  Json = 'JSON',
  Custom = '自定义',
}

export const presetTemplates: Record<Preset, string> = {
  [Preset.Standard]: '【{up}】{title}\n⏱ {duration} · ▶ {views} · 👍 {likes}\n{short_url}',
  [Preset.Minimal]: '{title} {short_url}',
  [Preset.Data]:
    '{title}\n时长 {duration} · 播放 {views} · 点赞 {likes} · 投币 {coins}\n{short_url}',
  [Preset.Markdown]: '[{title}]({url}) — {up} · {duration}',
  [Preset.Link]: '{short_url}',
  [Preset.Json]:
    '{"title":"{title}","up":"{up}","bvid":"{bv}","duration":"{duration}","views":"{views}","likes":"{likes}","url":"{url}"}',
  [Preset.Custom]: '',
}

export const defaultTemplate = presetTemplates[Preset.Standard]

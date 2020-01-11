# インストールの説明
この説明では、ブラウザに「Bilibili-Evolved」をインストールするのに役立ちます.

## 1. インストール前の注意
ブラウザを確認してください.「Bilibili-Evolved」は **最新** の「Chrome / Firefox / Safari」で実行する必要があります.

### Edge (UWP) [**サポート停止**]
- 上記のブラウザを使用してください. あるいはこの[Chromium-based Edge](https://microsoftedgeinsider.com/)に切り替えることができます.

下記のチュートリアルでは、例として Chrome を使用します:

<img height="300" alt="Chrome" src="images/compressed/chrome.en-US.jpg">

## 2. インストール前の準備
> ユーザースクリプトマネージャ(user script manager)が既にある場合は、このステップをスキップします.

「Bilibili-Evolved」は、JavaScript code snippetsとして提供されています.ビリビリを访ねる時、個人設定を保持するたびにコード(code)を実行できるように、ユーザースクリプトマネージャーが必要です.

サポートされているマネージャ: [Tampermonkey](https://tampermonkey.net/) と [Violentmonkey](https://violentmonkey.github.io/).

お好きなマネージャを選択して、リンクをクリックして、そのホームページにアクセスするか、ブラウザの拡張ストアにアクセスしてください.
> Greasemonkeyという別のマネージャを知っているかもしれませんが、残念ながらそれはサポートされていません.

例えば、Chrome Web StoreからTampermonkeyをインストールする.

<img height="300" alt="Install from Chrome Web Store" src="images/compressed/tampermonkey.en-US.jpg">

## 3. インストール
少なくとも1つのユーザスクリプトマネージャをインストールしたら、「Bilibili-Evolved」のバージョンを選択してインストールできます. (インストールしたいバージョンの名をクリックしてください)

| [公式版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js) | [プレビュー版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview.user.js) | [オフライン版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.offline.user.js) | [プレビュー・オフライン版](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview-offline.user.js) |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 安定した機能を提供しますが、頻繁には更新されません.                                     | 新機能はここでテストされ、より頻繁に更新されます.                                              | GitHubサーバーの問題を回避するためにすべての依存関係をインライン化しました.                                          | その名の通り、プレビュー＋オフライン.                                                                                |

> ⚠ 時々には、破壊的な大きな更新は、古いスクリプトが完全に使用できなくなります、適時に更新を確認してください.

例えば、オフライン版をインストールする

<img height="350" alt="Install Offline version" src="images/compressed/install-script.zh-CN.jpg">

## 4. 翻訳言語を変更する (オプション)
> 翻訳言语は自分自身のブラウザのデフォルト言语に自动的に设定します.それがなければ、このステップに従って翻訳言语を変えることができます.

ビリビリを访ねると、ページの左側に2つのアイコン(追加機能と设定)があるはずです.アイコンをクリックすることで「設定」を展開します.

今の言語が簡体字中国語（デフォルトのフォールバック言語）であると仮定し、 `工具`(道具)を展開し、 `界面翻译`(UI 翻訳)を見つけます.

有効にして見たい翻訳言語を選択してからページを更新します.

例えば、翻訳言語として「英語」を選択する

<img height="500" alt="Open settings" src="images/compressed/settings-icon.en-US.jpg">
<img height="500" alt="Change settings" src="images/compressed/settings.en-US.jpg">

## 5. 最後
今、準備万端です！ 設定や追加機能を探索して興味深い機能を発見できます.
もし、新しい機能とバグを提案したり、私のGitHub repoに報告してください.
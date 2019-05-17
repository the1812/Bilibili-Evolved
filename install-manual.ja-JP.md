# インストールの説明
この説明では、ブラウザに「Bilibili-Evolved」をインストールするのに役立ちます.

## 1. インストール前の準備
ブラウザが「Bilibili-Evolved」の互換性を確保するよう、下記互換性情報をチェックしてください.

> 簡単に言えば、Chrome、Edge (Chromium)、Firefox、Safariがサポートされています.下记の注意事項のほとんどは、それらの機能に影響を与えません.

### Chrome / Edge (Chromium)
- 背景ぼかし効果を使用するには ([backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter))、 このページで手動で有効にする必要があります `chrome://flags/#enable-experimental-web-platform-features`. (For Edge, change `chrome` to `edge`)
- 背景ぼかし効果は、アニメーションのフレームドロップを引き起こす可能性があります.
- もし、君の Chrome のバージョンが ≥ 73と画面 DPI/ページのズームが 100% よりも大きい、背景ぼかし効果が正しく表示されない. 詳しい原因はこのページ [Chromium Issue #942910](https://bugs.chromium.org/p/chromium/issues/detail?id=942910) をご覧ください.
### Firefox
- 背景ぼかし効果が無効です、詳しい原因はこのページ [Bugzilla #1178765](https://bugzilla.mozilla.org/show_bug.cgi?id=1178765) をご覧ください.
- タッチジェスチャの使用時にアニメーションの現象があります. (原因は CSS `transition`. プロパティ値は現在値ではなく、常に初期値から変更する)
### Safari
- Safari でテストされない. (私はMacを持っていません)
### Edge (UWP) [**サポート停止**]
- 上記のブラウザを使用してください. あるいはこれに切り替えることができます[Chromium-based Edge](https://microsoftedgeinsider.com/).

下記のチュートリアルでは、例として Chrome を使用します:

![Chrome](images/original/chrome.en-US.png)

## 2. Get a user script manager
> If you already have one, skip this step.

Bilibili-Evolved is delivered as JavaScript code snippets, a user script manager is required to help you execute the code every time you visit bilibili and keep your personal settings.

Supported managers: [Tampermonkey](https://tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/).

Choose one you like and click the link to visit its homepage, or get it in your browser's extension store.
> You may know another manager called Greasemonkey, unfortunately it's not supported.

e.g. Install Tampermonkey from Chrome Web Store

![Install from Chrome Web Store](images/original/tampermonkey.en-US.png)

## 3. Install
Having at least one user script manager installed, you can now select a version of Bilibili-Evolved to install. (Click the name to install)

| [公式バージョン](https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.user.js) | [プレビューバージョン](https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js) | [オフラインバージョン](https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.offline.user.js) | [オフライン・プレビューバージョン](https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview-offline.user.js) |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Provides stable features, but not frequently updated.                                     | New features got tested here, updated more frequently.                                              | Inlined all dependencies to avoid GitHub server problems.                                          | As the name says, Preview + Offline.                                                                                |

> ⚠ Sometimes the breaking changes will cause old version not work at all, please update the script in time.

e.g. Install the Offline version

![Install Offline version](images/original/install-script.zh-CN.png)


## 4. Change the display language (Optional)
> Language should be automatically set to your browser's default language. If not, you can follow this step to change the display language.

Visit bilibili, there should be 2 icons (Add-ons and settings) on the left side of page. Open settings by clicking the icon.

Assuming the current language is Simplified Chinese (default fallback language), unfold `工具` (tools) category and find `界面翻译` (UI translation).

Enable it and select a target language you want to see, then refresh the page.

e.g. Select English as target language

![Open settings](images/original/settings-icon.en-US.png)
![Change settings](images/original/settings.en-US.png)

## 5. Enjoy
You are all set! Explore settings and add-ons to discover interesting features, and feel free to suggest a new feature or report a bug on my GitHub repo.
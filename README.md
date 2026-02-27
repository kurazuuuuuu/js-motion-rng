# js-motion-rng

> [!NOTE]
> 思いつきをCodexで具現化したやつです。実用性については知りません。

ブラウザ向けの `DeviceMotionEvent` データ処理ライブラリです。

## 機能

- `DeviceMotionEvent` からモーションデータを抽出
- 数値フィールドにロジスティック写像ベースのカオス変換を適用
- すべての値を SHA-256 でハッシュ化
- `null` は固定トークン由来の安定ハッシュへ変換
- 抽出した全ハッシュを統合し、単一の乱数（`BigInt`）を生成

## インストール

```bash
npm install js-motion-rng
```

## 使い方

```js
import { processMotionEventWithRandom } from "js-motion-rng";

window.addEventListener("devicemotion", async (event) => {
  const { randomNumber, randomNumberNormalized, hashedData } = await processMotionEventWithRandom(event);

  console.log(randomNumber.toString()); // BigInt
  console.log(randomNumberNormalized); // [0, 1) の number
  console.log(hashedData); // ハッシュ化済みデータ
});
```

## API

### `processMotionEvent(event)`

`DeviceMotionEvent` を入力として、以下を含むハッシュ化済みオブジェクトを返します。

- `timestamp`
- `interval`
- `acceleration`
- `accelerationIncludingGravity`
- `rotationRate`

返却される各値は SHA-256 ハッシュ文字列です。

### `generateMotionRandomNumber(event)`

モーションデータから生成した全ハッシュ（タイムスタンプ由来ハッシュを含む）を統合し、
単一の `BigInt` 乱数を返します。

### `generateMotionRandomNumberNormalized(event)`

`generateMotionRandomNumber` の結果から導出した、`[0, 1)` 範囲の `number` を返します。

### `processMotionEventWithRandom(event)`

1回の呼び出しで以下を返します。

- `hashedData`
- `randomNumber`（`BigInt`）
- `randomNumberNormalized`（`number`, `[0, 1)`）

## テスト

```bash
npm test
```

## ブラウザ実行例

```bash
npm run example:serve
```

`examples/browser/index.html` をローカルサーバー経由で開き、
デバイスモーションの権限を許可して動作を確認してください。

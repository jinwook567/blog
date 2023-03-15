---
title: 인덱스 시그니처가 정의된 타입에서 Omit 유틸리티 타입을 사용하면?
date: 2023-03-15
description: 인덱스 시그니처, Exclude, Omit 타입 유틸리티에 대한 이해
---

다음과 같이 인덱스 시그니처가 정의되어 있는 타입이 있다.

```ts
type TypeWithIndexSignature = {
  a: number;
  b: number;
  c: number;
  [index: string]: number;
};

type Omitted = Omit<TypeWithIndexSignature, 'c'>;
```

`TypeWithIndexSignature`에서 c라는 속성을 제거하고 싶어 Omit 유틸리티를 사용했을 때 원하는 타입을 얻을 수 있을까?

내가 원하는 타입의 형태는 아래와 같다.

```ts
type Omitted = {
  a: number;
  b: number;
  [index: string]: number;
};
```

하지만 아래와 같이 엉뚱한 타입을 얻게된다.

```ts
type Omitted = {
  [x: string]: number;
  [x: number]: number;
};
```

왜 그럴까? 이유를 알기 위해서는 Omit 유틸리티에 사용되는 Exclude 유틸리티와, Omit 유틸리티 타입에 대해서 이해해야 한다.

Exclude 타입에 대해서 먼저 이해해보자.

```ts
type Exclude<T, U> = T extends U ? never : T;
```

Exclude는 조건부 타입으로 이루어져있다. T가 U에 할당 가능하다면, (T가 U보다 작은 범위라면) never, 아니라면 T를 반환한다. 근데 분산 조건부 타입이라는 것이 있는데 T에 유니온 태그가 할당되었고 naked type parameter라면, 모든 유니온에 대해서 조건부 타입에 대한 검증을 수행하여 타입을 반환한다.

```ts
type Excluded = Exclude<'monkey' | 'lion' | 'tiger', 'lion'>;
type Excluded =
  | Exclude<'monkey', 'lion'>
  | Exclude<'lion', 'lion'>
  | Exclude<'tiger', 'lion'>;
type Excluded = 'monkey' | never | 'tiger';
type Excluded = 'monkey' | 'tiger';
```

never 타입이 유니온 타입에 존재하는 것은 의미가 전혀 없기에 타입스크립트에서 해당 타입을 제거한다.

Omit 타입에 대해서 이해해보자.

```ts
type Omit<T, K extends string | number | symbol> = {
  [P in Exclude<keyof T, K>]: T[P];
};
```

Mapped Type에 대한 이해가 선행되어야 한다.
Mapped Type은 다른 타입을 바탕으로 새로운 타입을 생성할 수 있다.
Mapped Type을 활용하여 Alphabet 타입의 속성을 가지되, 속성의 타입이 모두 `string | number`인 타입을 생성해보도록 하겠다.

```ts
type Alphabet = {
  a: string;
  b: string;
  c: string;
};

type Mapped = {
  [P in keyof Alphabet]: string | number;
};

type Mapped = {
  a: string | number;
  b: string | number;
  c: string | number;
};
```

Mapped Type은 키를 통해 타입을 순회하며 타입을 생성한다. `TypeWithIndexSignature`의 key 타입을 구해보자.

```ts
type Key = keyof TypeWithIndexSignature;
type Key = 'a' | 'b' | 'c' | string | number;
type Key = string | number;
```

`'a' | 'b' | 'c'`는 string이라는 타입에 포함되기 때문에 string으로 합쳐진다. 그런데 number라는 타입은 왜 갑자기 생긴걸까?

```ts
type Obj = {
  '1': string;
  '2': string;
};

const obj: Obj = {
  '1': '1',
  '2': '2',
};

obj['1']; // '1'
obj[1]; // '1'
```

javascript에서 객체의 속성에 접근할 때 숫자라면 암묵적으로 문자로 형변환이 일어난다. 이는 타입스크립트에서도 동일하게 동작한다. 따라서 인덱스 시그니처에 키의 타입으로 `string`이 할당되었다면 사실은 `string | number`인 것이다.

```ts
type IndexSignature = {
  [key: string]: number;
};
type IndexSignature = {
  [key: string | number]: number;
};
```

Omit 타입 유틸리티의 도출 과정을 정리해보면 아래와 같다.

```ts
type TypeWithIndexSignature = {
  a: number;
  b: number;
  c: number;
  [index: string | number]: number;
};

type Key = string | number;
type Excluded = Exclude<Key, 'c'>;
// string은 c에 할당될 수 없기에 string, number 또한 c에 할당될 수 없기에 number
type Excluded = string | number;

type Omitted = {
  [P in string | number]: TypeWithIndexSignature[P];
};

type Omitted = {
  [x: string]: number;
  [x: number]: number;
};
```

라이브러리에서 제공하는 타입을 제어하기 위해서 Omit 유틸리티를 사용했는데, 너무 엉뚱한 타입이 나와서 혼란스러웠다. 해당 타입에 인덱스 시그니처가 정의되었다는 사실을 몰랐다. Omit 유틸리티에 대해서 분석해본 결과 인덱스 시그니처가 정의되어 생기는 문제였음을 알게되었고 상속이 중첩된 구조인 라이브러리의 타입을 타고 타고 가다보니, 인덱스 시그니처가 정의되어 있는 것을 확인할 수 있었다.

다음과 같은 제너릭 타입을 정의하여 인덱스 시그니처를 제거한 이후에 Omit 유틸리티를 사용하여 특정 속성을 제거하고, 다시 인덱스 시그니처를 정의해주어 라이브러리 타입과 유사하게 만들어주었다.

```ts
export type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : K]: T[K];
};
```

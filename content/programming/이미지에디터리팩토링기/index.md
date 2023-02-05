---
title: 이미지 에디터 리팩토링기
date: 2023-01-26
description: 리팩토링을 하면서 나는 무엇을 느꼈는가
---

# 프로젝트 설명

canvas api를 사용하여 웹 브라우저에서 이미지 편집 등 간단한 포토샵 기능을 사용할 수 있는 프로젝트이다.
![project image](./editor.png)

이전에 위투디 프로젝트를 했을 때 구현 했었지만, 기술적으로 어려웠고 코드가 깔끔하지 않아서 언젠가 다시 만들어봐야 겠다고 생각했다.

약 1년이 지나 다시 만들어보면서 느낀 점을 기록한 글이다.

# 프로젝트 목표

1. 깊게 고민하고 코드 작성하기.

   키보드에 손을 올리기 전에, 검색하기 전에 깊게 고민해야한다. 이 프로젝트의 목표는 단순히 구현이 아니라, 정교한 설계 및 깔끔한 코드를 작성하는 방법을 연습하기 위함이다.

2. 테스트 코드 작성하기.

   코드가 정상적으로 동작하는지 확인하기 위해서, 코드 변경이나 리팩토링 시에 사이드 이펙트를 줄이기 위해서 등 테스트 코드를 작성해야 하는 이유는 많지만 지금까지 작성하지 않았다.

   고객에게 테스트해보고 빠르게 요구에 맞게 변경해야해서 코드의 생존기간이 길지 않았고 무엇보다 테스트 코드를 작성하는 것이 귀찮다고 생각했다. 테스트 코드를 작성해보면서 필요성과 장점을 느껴봐야한다.

3. 소프트웨어 비즈니스.

   프로젝트의 첫 번째 목표는 개발 실력 향상이지만, 프로젝트를 활용하여 간단한 비즈니스를 할 수 있어보인다.

   프로젝트와 유사한 소프트웨어를 인쇄업계에 제공하는 업체가 있는데 구독 가격이 월 16만 5천원이다. 에디터의 수준도 그리 높지 않아보이고 무엇보다 인쇄업체 사장님들에게는 너무 비싸다. 또한 해당 업체의 연 매출은 약 20억으로, 잘하면 어느 정도의 고정 수입을 만들 수 있어보인다.

# 고민했던 순간들

## 프로젝트 구조에 대해서

데스크탑 환경일 때, 모바일 환경일 때 UI가 많이 다름에따라 컴포넌트 배치가 달라질 것으로 예상했다. 컴포넌트 간의 의존성을 줄이고 유연하게 합성할 수 있으면 좋겠다고 생각했다.

따라서 전체적인 시스템을 compound component 형태로 제작하였다. compound component는 암묵적으로 상태를 공유하여 컴포넌트 간의 의존성을 줄여 유연한 컴포넌트 조합을 가능하게 한다.

상태를 공유하기 위해서 상태 관리 도구가 필요하였는데 recoil을 사용하였다. 보통의 compound component 패턴은 context api를 사용하지만, 컴포넌트를 합성하는 규모가 커서 불필요한 리렌더링이 많이 발생할 것으로 예상하여 recoil을 사용하였다.

## 컴포넌트의 props

컴포넌트에서 props가 정의되는 이유는 2가지라고 생각한다.

1. 재사용성을 위해서

   특정 로직에 의존할수록 재사용성은 떨어진다. 컴포넌트의 재사용성을 높이기 위해서 컴포넌트 내부에 상태나 특정한 로직이 존재하지 않고, props를 통해서 주입받는다.

2. 관심사의 분리를 위해서

   컴포넌트가 비대할 경우 우리는 컴포넌트를 쪼갠다. 추상화 수준을 높이고 관심사를 분리하기 위해서이다. (하나의 컴포넌트는 하나의 관심사만 가지거나, 이들의 조합으로 이루어져야 한다)

   이 경우 props는 상태를 공유받기 위해서 사용된다. 쪼개진 컴포넌트는 부모 컴포넌트에 종속되며 거의 다른 컴포넌트에서 재사용되지 않는다.

컴포넌트에서 props를 정의할 때, 의식적으로 어떤 이유로 props가 정의되었는지 생각해야 올바르게 컴포넌트를 설계할 수 있다고 생각한다.

다음 예시는 프로젝트 내에서 사용된 Stage 컴포넌트이다. Stage 컴포넌트를 통해서 왜 이런 props를 정의했는지 살펴보도록 하겠다.

```tsx
import { Stage as ReactKonvaStage } from 'react-konva';

type Props = {
  children: React.ReactNode;
  onDownload: (ref: RefObject<Konva.Stage>) => void;
};

function Stage({ children, onDownload }: Props) {
  const { width, height } = useRecoilValue(stageSizeState);
  const isTriggeredDownload = useRecoilValue(isTriggeredDownloadState);
  const { deselect } = useSelect();
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    if (isTriggeredDownload) onDownload(stageRef);
  }, [isTriggeredDownload]);

  return (
    <ReactKonvaStage
      width={width}
      height={height}
      onTouchStart={e => e.target === e.target.getStage() && deselect()}
      onMouseDown={e => e.target === e.target.getStage() && deselect()}
      ref={stageRef}
    >
      {children}
    </ReactKonvaStage>
  );
}
```

Stage 컴포넌트는 ReactKonvaStage라는 컴포넌트에 필요한 상태와 이벤트 핸들러를 결합시켜주는 역할을 수행한다. ReactKonvaStage는 react-konva 라이브러리로부터 받아온 컴포넌트이며, canvas 태그를 만드는 역할을 수행한다.

1. children props를 왜 정의했는가?

   Stage 컴포넌트는 재사용 가능한 컴포넌트에 특정 로직이 결합된 상태인데 이 상태로 재사용 될 가능성이 있다고 생각했다.
   재사용 과정에서 Stage 컴포넌트 내부는 다양한 컴포넌트의 조합으로 이루어질 수 있기 때문에, children props를 정의함으로써 컴포넌트 사용부에서 내부 요소를 삽입해줄 수 있도록 하였다.

   또한 children props로 정의함에 따라서 불필요한 리렌더링도 방지할 수 있다. 만약 children props가 아닌 Stage 컴포넌트 내부에 자식 컴포넌트로 정의하면 Stage 컴포넌트의 상태 변화에 따라서 자식 컴포넌트도 리렌더링된다. 하지만 children props로 정의되어 있기에 Stage에 한정된 상태 변화라면 리렌더링이 발생하지 않는다.

2. width, height, isTriggeredDownload, deselect는 왜 props로 정의하지 않았는가?

   해당 props를 지닌 형태의 컴포넌트가 재사용되지 않을 것이라고 생각했다. 재사용되지 않기에 props로 상태나 로직을 주입받을 필요가 없다. 재사용 가능성이 매우 낮음에도 불구하고, 재사용 가능한 컴포넌트로 제작하기 위해서 위의 값들을 props로 받는다면 섣부른 최적화라고 생각한다.

   또한 위 props들은 상태를 공유받기 위해서 props를 사용할 필요도 없다. recoil을 이용하여 상태에 직접 접근할 수 있기 때문이다.

   따라서 props를 통해 주입받는 것이 아닌, 컴포넌트 내부에 상태나 로직을 직접 정의하였다.

3. onDownload props를 왜 정의했는가?

   onDownload props는 함수로 Stage에 직접 접근한 값인 stageRef를 받아서 다운로드를 수행한다. props로 받은 이유는 상태 공유의 단순화를 위해서이다.

   추후에 지원할 압축 파일로 다운로드 등의 기능을 지원하기 위해서는 많은 상태를 상위 컴포넌트로부터 props로 받아와야해서 상위 컴포넌트와 해당 컴포넌트의 복잡도가 전부 증가할 것이라고 생각했다.

   컴포넌트의 관심사 입장에서 보았을 때, 하나의 함수를 만들기 위해서 알 필요없는 여러가지 값들을 공유받을 필요가 있을까?, 상위 컴포넌트에서 함수를 만드는 것이 상위 컴포넌트 본인의 관심사가 아닐수도 있지만, 해당 컴포넌트의 관심사가 아닌 불필요한 상태를 공유해주는 것보다 낫다고 생각했다.

정리를 해보면

1. 상태를 공유받기 위해서 props가 정의되었을 때, 꼭 props를 통해 받아와야 하는지 생각해봐야한다. 상태 관리를 통해서 직접 접근할수도 있고, 컴포넌트를 제공하는 커스텀훅을 사용하여 처리할수도 있다.

   커스텀훅을 사용하여 처리하는 방식은 다음과 같다.

   커스텀 훅 내부에 상태를 정의하고, 자식 컴포넌트로 들어갈 내용도 커스텀 훅 내부에 위치시키고 상태를 이용한다. 그리고 커스텀훅은 상태와 컴포넌트를 반환한다.

   부모 컴포넌트는 본인의 주요 관심사가 아닌 상태를 정의할 필요 없으며 커스텀 훅을 통해서 상태를 받아 이용할 수 있다. 또한 컴포넌트도 반환받기에 렌더링 시키고 싶은 부분에 위치시켜주면 된다.

2. 컴포넌트가 재사용되어 중복을 줄이기 위해 컴포넌트가 생성되었다면 props를 통해서 상태나 로직을 주입받아야한다.

## 라이브러리의 타입 제어하기.

Canvas를 다루기 위해 Konva라는 라이브러리를 사용하였다. 해당 라이브러리는 Canvas 내 삽입될 수 있는 다양한 요소를 컴포넌트 형태로 제공한다.

라이브러리를 활용하여 Canvas 내 요소를 다루는 방법은 2가지이다.

1. 라이브러리에서 제공하는 컴포넌트의 속성을(props) 변형시키는 방법. 속성이 변경되면 리렌더링 되면서 변경 사항이 적용된다
2. useRef 훅을 사용하여 요소에 직접 접근하여 명시적으로 변형시키는 방법

선언적인 1번 방식이 리액트스럽다 생각했다. 또한 상태를 보유함으로써 변형된 요소의 형태를 기억할 수 있고 이는 히스토리, 추후에 지원할 임시 저장 등의 기능을 손쉽게 구현 가능토록 할 것 이다.

따라서 컴포넌트의 속성을 제어할 수 있도록 상태를 정의하고 요소의 변형이 필요하다면 상태를 변경시킨다.

상태만 잘 다루면 된다. Canvas가 하나만 존재한다는 가정으로 생각해보겠다.
Canvas 내부에 들어갈 수 있는 요소의 종류는 여러개이며(Image,Text,Group 등), 여러개의 요소가 들어갈 수 있다.

상태의 타입을 생각해보자. 요소의 종류는 여러개이므로 유니온 타입이며 여러개의 요소가 들어갈 수 있으므로 배열 형태이다. 즉 유니온 타입이 배열의 엘리먼트로 존재하는 상황이다.

유니온 타입은 라이브러리에서 제공하는 컴포넌트 타입들에 기반하여 구성되며, 각각의 타입은 라이브러리에서 제공하는 컴포넌트에 대한 타입과 거의 유사하나 일부 차이점이 있다.

컴포넌트 종류에 따라서 분기를 해주어야 하기에 컴포넌트 종류에 대한 정보를 담고 있어야하며, 요소가 추가될 때 초기 위치를 구하기 위해서 라이브러리에서 제공하는 타입에서는 optional로 적용된 일부 속성을 필수로 변경시켜야 했다. 또한 일부 속성은 제거되어야 했다.

유니온 타입을 구성할 때 라이브러리의 컴포넌트에 대한 타입을 최대한 이용하기로 했다. 그 이유는 당장 사용되는 속성만을 정의하는 방식은 기능 확장에 유리하지 않을 것이라고 생각했다. 이 경우에는 기능을 확장할 때, 해당 기능이 사용하는 속성에 대한 타입을 추가해줘야 한다. 하지만 기존 타입을 최대한 활용하면 기능 확장을 할 때, 필요한 타입 정보를 추가하지 않아도 된다.

아래는 캔버스 내 요소가 Image일 때의 타입 예시이다.

```ts
import Konva from 'konva';

type RequiredNodeConfig = Required<
  Pick<Konva.NodeConfig, 'id' | 'x' | 'y' | 'scaleX' | 'scaleY'>
>;

type RequiredImageConfig = Required<
  Pick<Konva.ImageConfig, 'width' | 'height'>
>;

export type KonvaImageConfig = RequiredNodeConfig &
  RequiredImageConfig &
  Omit<RemoveIndex<Konva.ImageConfig>, 'image'> & {
    type: 'image';
    url: string;
  };
```

(Konva.ImageConfig는 Konva.NodeConfig를 상속받는다.)

Required라는 타입 유틸리티를 사용하여 optional로 정의된 타입을 필수로 존재하도록 변경하였다.

또한 DOM에 직접 접근한 정보인 image라는 속성 대신 이미지 경로인 url이라는 속성이 필요하여 Omit 유틸리티를 활용하여 타입에서 image 속성을 제거해주었다. 이 과정에서 RemoveIndex라는 타입을 정의하였는데 그 이유는 인덱스 시그니처가 라이브러리 타입에 존재하여 Omit 유틸리티가 내가 원하는대로 동작하지 않았기 때문이다. 이에 대한 내용은 트러블슈팅 파트에서 기술하겠다.

마지막으로 type 속성을 추가하여 태그된 유니온 방식으로 컴포넌트의 종류를 분기할 수 있도록 하였다.

아래는 최종으로 완성된 상태의 타입이다. 상태는 KonvaStage라는 타입을 지니게 된다. 배열을 순회하며 type에 따라 적절한 컴포넌트를 매칭시켜준다.

```ts
export type KonvaNodeConfig =
  | KonvaImageConfig
  | KonvaTextConfig
  | KonvaGroupConfig;

export type KonvaStage = KonvaNodeConfig[];
```

## 테스트 어떻게 하면 좋을까?

테스트는 jest와 react-test-library를 이용하기로 하였다. jest는 zero-config라는 장점 때문에, react-test-library는 실제 브라우저 DOM을 기준으로 테스트를 하기에 사용자 입장을 가장 잘 반영한 테스트라고 생각되어 선택하였다.

최대한 효율적으로 테스트를 하고 싶었다.
단순히 컴포넌트에 특정 요소가 존재하는지 확인하는 테스트는 하고 싶지 않았다.

테스트를 하는 가장 큰 목적은 코드 수정 시 예측하지 못한 사이드 이펙트를 확인할 수 있는 것이라고 생각하는데, 단순히 UI와 관련되어 컴포넌트에서 특정 요소를 지우거나 수정하는 것은 개발자가 충분히 예측 가능한 변화라고 생각하기 때문이다. 물론 이벤트 핸들러를 할당받은, 기능과 관련된 요소의 삭제는 전체적인 기능의 동작에 문제를 일으킬 수 있기 때문에, 존재 유무를 테스트 해야 한다고 생각한다.

따라서 테스트는 내가 의도한대로 기능이 정상적으로 동작하는지를 중점으로 테스트하였고, canvas 부분은 konva 라이브러리 자체적으로 테스트가 되어있기에 canvas 내에서 사용되는 state에 대해서만 테스트를 수행했다.

canvas 내의 state는 recoil로 관리되고 recoil 상태를 관리하는 로직은 hook을 사용하여 관리하였기에 따로 hooks 폴더로 추출하였다. canvas와 관련된 테스트는 hooks 폴더 내부에 존재하고, 이 외 테스트는 컴포넌트 폴더 내부에 위치시켰다.

canvas 관련 테스트 코드의 효율적인 작성을 위해 hooks를 모아둔 useEditor라는 hook을 정의하였고 이를 활용하여 테스트 환경을 setup하는 함수를 정의하여 활용하였다.

```tsx
function setupRenderUseEditorHook() {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>{children}</RecoilRoot>
  );

  const { result } = renderHook(() => useEditor(), {
    wrapper,
  });

  act(() => {
    result.current.setStageSize({ width: 1000, height: 1000 });
  });

  return result;
}
```

컴포넌트 관련 테스트는 NHN에서 작성한 [React Testing Library를 이용한 선언적이고 확장 가능한 테스트](https://ui.toast.com/weekly-pick/ko_20210630)의 글을 참고하여 작성하였다.

보통의 테스트 코드는 명령형으로 작성되는데, 위의 글을 참고하여 선언형으로 작성하면 확장이 쉬우며 가독성이 크게 상승한다.

# 트러블 슈팅

## 인덱스 시그니처가 정의된 타입에서 Omit 유틸리티 타입을 사용하면?

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

왜 그럴까? Exclude, Omit 유틸리티 타입에 대해서 이해해야 한다.

```ts
type Exclude<T, U> = T extends U ? never : T;
type Omit<T, K extends string | number | symbol> = {
  [P in Exclude<keyof T, K>]: T[P];
};
```

Exclude 타입에 대해서 먼저 이해해보자. Exclude는 조건부 타입으로 이루어져있다. T가 U에 할당 가능하다면, (T가 U보다 작은 범위라면) never, 아니라면 T를 반환한다. 근데 분산 조건부 타입이라는 것이 있는데 T에 유니온 태그가 할당되었고 naked type parameter라면, 모든 유니온에 대해서 조건부 타입에 대한 검증을 수행하여 타입을 반환한다.

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

Omit 타입에 대해서 이해해보자. Mapped Type에 대해서 먼저 이해해야한다. Mapped Type은 다른 타입을 바탕으로 새로운 타입을 생성할 수 있다.
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

부끄럽지만 타입 유틸리티를 사용하면서 내부 구조에 대해서 자세히 알지 못했다.
Konva 라이브러리에서 제공하는 타입을 여러번 읽고나서야 인덱스 시그니처가 정의되있는걸 발견했고 이것 때문에 문제가 발생했나? 생각하며 실험해보았다. 실험을 통해 결국 문제를 해결했지만, 만약 내가 내부 구조를 잘 파악하고 있었다면 오류의 원인을 파악하는데 오랜 시간을 들이지 않았을 것이다.

# 앞으로 추가할 기능

- 모바일 환경 지원
- 텍스트 관련 기능(폰트, 글자 크기, 색상 등)
- 이미지 자르기
- 이미지 수정(밝기, 필터 등)
- 레이어 관련 기능(zIndex 변경)
- drag & select
- 레이아웃 가이드라인 기능

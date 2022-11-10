# Pager RN

This library is a port of [`react-native-pager`](https://github.com/ajsmth/react-native-pager) using the latest Reanimated / React Native Gesture Handler APIs

<p align="center" style="display: flex; justify-content: center; align-items:center;">
<img src="https://user-images.githubusercontent.com/40680668/201206918-d8cede47-0421-4464-a221-d1e6d46c5ba4.mov" width="300px" />  
</p>



## Install

```bash
yarn add pager-rn
```

**_Required Peer Dependencies_**:

```bash
yarn add react-native-reanimated react-native-gesture-handler
```

Note: These versions were used to develop this package:

```json
{
  "react-native-gesture-handler": "^2.8.0",
  "react-native-reanimated": "^2.12.0"
}
```

## Basic Example

```tsx
import * as React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Pager } from "pager-rn";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pager.Root>
        <Pager.Container>
          <Pager.Page>
            <MyPage>1</MyPage>
          </Pager.Page>
          <Pager.Page>
            <MyPage>2</MyPage>
          </Pager.Page>
          <Pager.Page>
            <MyPage>3</MyPage>
          </Pager.Page>
        </Pager.Container>
      </Pager.Root>
    </GestureHandlerRootView>
  );
}

function MyPage({ children }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{children}</Text>
    </View>
  );
}
```

## Components

### `<Pager.Root />`

Establishes the pan-able area for the pager.

### `<Pager.Container />`

Where the `Pages` are rendered.

### `<Pager.Page />`

Namespace for an individual `Page`

## Props

```tsx
import * as React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { Pager } from "pager-rn";

export default function App() {
  // Control the current activeIndex with state:
  let [activeIndex, setActiveIndex] = React.useState(0);

  // Access the animatedIndex to synchronize your own animations
  let myAnimatedIndex = useSharedValue(0);

  // Apply styles to the area around the pager
  let rootStyles = { padding: 24 };

  // Apply styles to the pager
  let containerStyles = { padding: 24, borderWidth: 1, overflow: "hidden" };

  // Orient pages vertically:
  let orientation = "vertical"; // or "horizontal"

  // Loop the slides infinitely - defaults to false
  let circular = false;

  // Restrict the number of pages rendered at any given time:
  let maxPages = 5;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pager.Root
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        animatedIndex={myAnimatedIndex}
        style={rootStyles}
        orientation={orientation}
        circular={circular}
        maxPages={maxPages}
      >
        <Pager.Container style={containerStyles}>
          <Pager.Page>
            <MyPage>1</MyPage>
          </Pager.Page>
          <Pager.Page>
            <MyPage>2</MyPage>
          </Pager.Page>
          <Pager.Page>
            <MyPage>3</MyPage>
          </Pager.Page>
        </Pager.Container>
      </Pager.Root>
    </GestureHandlerRootView>
  );
}
```

## Interpolations

```tsx
import * as React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { Pager, Interpolation } from "pager-rn";

// Interpolations apply styles to a page based on its relative position
let interpolation: Interpolation = {
  transforms: {
    // Apply 0.2 scale to pages left of (or below) the active page
    scale: [0.2, 1],
    // Rotate pages around the active page by 45 degrees
    rotate: ["45deg", "0deg", "45deg"],
  },

  // Ensure sibling pages appear behind the active page
  zIndex: [0, 1, 0],

  // More granular interpolations are configurable:
  opacity: {
    // The input refers to the position relative to the active page
    // e.g [left, active, right]
    input: [-1, 0, 1],
    // The output is the applied style value
    // e.g [opacity: 0, opacity: 1, opacity: 0.6]
    output: [0, 1, 0.6],
    // Extrapolate is applied to values outside the bounds of input/output
    extrapolate: "clamp",
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pager.Root interpolation={interpolation}>
        <Pager.Container>
          <Pager.Page>
            <MyPage>1</MyPage>
          </Pager.Page>
          <Pager.Page>
            <MyPage>2</MyPage>
          </Pager.Page>
          <Pager.Page>
            <MyPage>3</MyPage>
          </Pager.Page>
        </Pager.Container>
      </Pager.Root>
    </GestureHandlerRootView>
  );
}
```

Interpolations can be applied at a page level via the `useInterpolation()` hook:

```tsx
import * as React from "react";
import Animated from "react-native-reanimated";
import { useInterpolation } from "pager-rn";

function MyPage({ bg = "white", children }) {
  let interpolatedStyle = useInterpolation({
    transforms: {
      scale: [0.2, 1],
      rotate: ["45deg", "0deg", "45deg"],
    },

    opacity: [0, 1, 0.5],
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bg,
        },
        interpolatedStyle,
      ]}
    >
      <Animated.Text>{children}</Animated.Text>
    </Animated.View>
  );
}
```
